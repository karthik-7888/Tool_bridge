import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/auth";
import { getSupabaseAdmin, supabaseConfigured } from "@/lib/supabase";

const saveHistorySchema = z.object({
  toolId: z.string().trim().min(1).max(80),
  toolName: z.string().trim().min(1).max(120),
  problem: z.string().trim().min(1).max(2000),
  response: z.object({
    summary: z.string(),
    dontDoThis: z.array(z.string()),
    steps: z.array(
      z.object({
        stepNumber: z.number(),
        title: z.string(),
        instructions: z.string(),
        command: z.string().nullable().optional()
      })
    ),
    commonMistakes: z.array(z.string()),
    checkpoint: z.string(),
    stillStuck: z.string()
  })
});

function requireUserEmail(email: string | null | undefined) {
  if (!email) {
    throw new Error("No authenticated user email found.");
  }

  return email;
}

export async function GET() {
  try {
    if (!supabaseConfigured) {
      return NextResponse.json({ items: [], configured: false });
    }

    const session = await getServerSession(authOptions);
    const email = session?.user?.email;

    if (!email) {
      return NextResponse.json({ items: [], configured: true }, { status: 200 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("analysis_history")
      .select("id, tool_id, tool_name, problem, response_json, created_at")
      .eq("user_email", email)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      configured: true,
      items: (data ?? []).map((item) => ({
        id: item.id,
        toolId: item.tool_id,
        toolName: item.tool_name,
        problem: item.problem,
        response: item.response_json,
        createdAt: item.created_at
      }))
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load history.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!supabaseConfigured) {
      return NextResponse.json({ saved: false, configured: false });
    }

    const session = await getServerSession(authOptions);
    const email = requireUserEmail(session?.user?.email);
    const body = saveHistorySchema.parse(await request.json());

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("analysis_history").insert({
      user_email: email,
      user_name: session?.user?.name ?? null,
      tool_id: body.toolId,
      tool_name: body.toolName,
      problem: body.problem,
      response_json: body.response
    });

    if (error) {
      throw error;
    }

    return NextResponse.json({ saved: true, configured: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid history payload." }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : "Could not save history.";

    if (message.includes("No authenticated user email")) {
      return NextResponse.json({ saved: false, configured: true }, { status: 401 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
