import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/auth";
import { getSupabaseAdmin, supabaseConfigured } from "@/lib/supabase";

const saveFeedbackSchema = z.object({
  toolId: z.string().trim().min(1).max(80).optional(),
  toolName: z.string().trim().min(1).max(120).optional(),
  problem: z.string().trim().min(1).max(2000).optional(),
  summary: z.string().trim().min(1).max(2000).optional(),
  feedback: z.string().trim().min(10).max(2000)
});

export async function POST(request: Request) {
  try {
    if (!supabaseConfigured) {
      return NextResponse.json({ saved: false, configured: false });
    }

    const session = await getServerSession(authOptions);
    const body = saveFeedbackSchema.parse(await request.json());

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("feedback_entries").insert({
      user_email: session?.user?.email ?? null,
      user_name: session?.user?.name ?? null,
      tool_id: body.toolId ?? null,
      tool_name: body.toolName ?? null,
      problem: body.problem ?? null,
      summary: body.summary ?? null,
      feedback: body.feedback
    });

    if (error) {
      throw error;
    }

    return NextResponse.json({ saved: true, configured: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid feedback payload." }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : "Could not save feedback.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
