import { NextResponse } from "next/server";
import { z } from "zod";

import { callGemini } from "@/lib/gemini";
import { buildSolvePrompt } from "@/lib/prompts";
import { getToolById, toolIds } from "@/lib/tools";

const uploadSchema = z.object({
  name: z.string().trim().min(1).max(160),
  mimeType: z.enum(["application/pdf", "image/png", "image/jpeg"]),
  dataUrl: z.string().trim().startsWith("data:").max(12_000_000),
  size: z.number().int().positive().max(8_000_000)
});

const previousContextSchema = z.object({
  toolName: z.string().trim().min(1).max(120),
  problem: z.string().trim().min(1).max(1000),
  summary: z.string().trim().min(1).max(1000),
  steps: z
    .array(
      z.object({
        title: z.string().trim().min(1).max(160),
        instructions: z.string().trim().min(1).max(1200)
      })
    )
    .max(6),
  checkpoint: z.string().trim().min(1).max(1000),
  stillStuck: z.string().trim().min(1).max(1000)
});

const solveInputSchema = z.object({
  tool: z.enum(toolIds),
  problem: z.string().trim().min(3).max(1000),
  errorMessage: z.string().trim().max(2000).optional().or(z.literal("")),
  assignmentType: z.string().trim().max(120).optional().or(z.literal("")),
  university: z.string().trim().max(120).optional().or(z.literal("")),
  assignmentPdf: uploadSchema.optional(),
  errorScreenshot: uploadSchema.optional(),
  previousContext: previousContextSchema.optional()
});

const solveStepSchema = z.object({
  stepNumber: z.number().int().min(1).max(8),
  title: z.string().trim().min(3),
  instructions: z.string().trim().min(10),
  command: z.string().trim().min(1).nullable().optional()
});

const SolveOutputSchema = z.object({
  summary: z.string().trim().min(10),
  dontDoThis: z.array(z.string().trim().min(3)).min(2).max(5),
  steps: z.array(solveStepSchema).min(3).max(8),
  commonMistakes: z.array(z.string().trim().min(3)).min(2).max(5),
  checkpoint: z.string().trim().min(5),
  stillStuck: z.string().trim().min(5)
});

const ipRequestCounts = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

function isRateLimited(ip: string) {
  const now = Date.now();
  const entry = ipRequestCounts.get(ip);

  if (!entry || now > entry.resetAt) {
    ipRequestCounts.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }

  if (entry.count >= 10) {
    return true;
  }

  entry.count += 1;
  return false;
}

function mapServerError(error: unknown) {
  if (!(error instanceof Error)) {
    return {
      status: 500,
      message: "Something went wrong - please try again."
    };
  }

  const message = error.message;
  const lowered = message.toLowerCase();

  if (lowered.includes("quota exceeded")) {
    return {
      status: 429,
      message: "AI quota reached for now. Try again in a few minutes."
    };
  }

  if (lowered.includes("api key not valid") || lowered.includes("invalid api key")) {
    return {
      status: 401,
      message: "AI service configuration error. Please contact support."
    };
  }

  if (lowered.includes("timed out") || lowered.includes("aborterror")) {
    return {
      status: 504,
      message: "This took too long. Try describing your problem more briefly and retry."
    };
  }

  if (
    lowered.includes("econnreset") ||
    lowered.includes("enotfound") ||
    lowered.includes("fetch failed") ||
    lowered.includes("network error")
  ) {
    return {
      status: 503,
      message: "Network error. Check your internet connection and try again."
    };
  }

  if (lowered.includes("did not return valid json") || lowered.includes("unexpected response")) {
    return {
      status: 500,
      message: "AI returned an unexpected response. Please try again."
    };
  }

  if (lowered.includes("high demand") || lowered.includes("try again later")) {
    return {
      status: 503,
      message: "The AI model is temporarily busy right now. Wait a few seconds and try again."
    };
  }

  return {
    status: 500,
    message: "Something went wrong. Please try again in a moment."
  };
}

function extractJsonPayload(rawText: string) {
  const cleaned = rawText.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "");
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("Gemini did not return valid JSON.");
  }

  return cleaned.slice(firstBrace, lastBrace + 1);
}

function sanitizeJsonPayload(rawJson: string) {
  let sanitized = "";
  let inString = false;
  let escaping = false;

  for (const character of rawJson) {
    if (escaping) {
      sanitized += character;
      escaping = false;
      continue;
    }

    if (character === "\\") {
      sanitized += character;
      escaping = true;
      continue;
    }

    if (character === "\"") {
      sanitized += character;
      inString = !inString;
      continue;
    }

    if (inString) {
      if (character === "\n") {
        sanitized += "\\n";
        continue;
      }

      if (character === "\r") {
        continue;
      }

      if (character === "\t") {
        sanitized += "\\t";
        continue;
      }
    }

    sanitized += character;
  }

  return sanitized.replace(/,\s*([}\]])/g, "$1");
}

function parseGeminiJson(rawText: string) {
  const extracted = extractJsonPayload(rawText);

  try {
    return JSON.parse(extracted) as unknown;
  } catch {
    return JSON.parse(sanitizeJsonPayload(extracted)) as unknown;
  }
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a minute before trying again." },
        { status: 429 }
      );
    }

    const body = (await request.json()) as unknown;
    const inputResult = solveInputSchema.safeParse(body);

    if (!inputResult.success) {
      return NextResponse.json(
        { error: "Please check the form fields and try again." },
        { status: 400 }
      );
    }

    const input = inputResult.data;

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Server is missing GEMINI_API_KEY." },
        { status: 500 }
      );
    }

    const tool = getToolById(input.tool);

    if (!tool) {
      return NextResponse.json({ error: "Unsupported tool selected." }, { status: 400 });
    }

    const prompt = buildSolvePrompt(input);
    const attachments = [input.assignmentPdf, input.errorScreenshot].filter(
      (file): file is NonNullable<typeof file> => Boolean(file)
    );
    const rawResponse = await callGemini(
      prompt,
      attachments.map(({ mimeType, dataUrl }) => ({ mimeType, dataUrl }))
    );
    const parsedJson = parseGeminiJson(rawResponse);
    const validatedResult = SolveOutputSchema.safeParse(parsedJson);

    if (!validatedResult.success) {
      throw new Error("AI returned an unexpected response.");
    }

    const validated = validatedResult.data;

    const normalized = {
      summary: validated.summary,
      dontDoThis: validated.dontDoThis,
      steps: validated.steps.map((step, index) => ({
        stepNumber: index + 1,
        title: step.title,
        instructions: step.instructions,
        ...(step.command ? { command: step.command } : {})
      })),
      commonMistakes: validated.commonMistakes,
      checkpoint: validated.checkpoint,
      stillStuck: validated.stillStuck
    };

    return NextResponse.json(normalized);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Please check the form fields and try again."
        },
        { status: 400 }
      );
    }

    console.error("ToolBridge solve error:", error);
    const mappedError = mapServerError(error);

    return NextResponse.json(
      {
        error: mappedError.message
      },
      { status: mappedError.status }
    );
  }
}
