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

const solveInputSchema = z.object({
  tool: z.enum(toolIds),
  problem: z.string().trim().min(20).max(1000),
  errorMessage: z.string().trim().max(2000).optional().or(z.literal("")),
  assignmentType: z.string().trim().max(120).optional().or(z.literal("")),
  university: z.string().trim().max(120).optional().or(z.literal("")),
  assignmentPdf: uploadSchema.optional(),
  errorScreenshot: uploadSchema.optional()
});

const solveStepSchema = z.object({
  stepNumber: z.number().int().min(1).max(8),
  title: z.string().trim().min(3),
  instructions: z.string().trim().min(10),
  command: z.string().trim().min(1).nullable().optional()
});

// ✅ CHANGE 1: added dontDoThis here
const SolveOutputSchema = z.object({
  summary: z.string().trim().min(10),
  dontDoThis: z.array(z.string().trim().min(3)).length(3),
  steps: z.array(solveStepSchema).min(4).max(8),
  commonMistakes: z.array(z.string().trim().min(3)).length(3),
  checkpoint: z.string().trim().min(5),
  stillStuck: z.string().trim().min(5)
});

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
      message:
        "Your Gemini API key is active, but this project has no available Gemini quota right now. Check Google AI Studio quota or billing, then try again."
    };
  }

  if (lowered.includes("api key not valid") || lowered.includes("invalid api key")) {
    return {
      status: 401,
      message: "Your Gemini API key is invalid. Replace GEMINI_API_KEY in .env.local and restart the dev server."
    };
  }

  if (lowered.includes("timed out")) {
    return {
      status: 504,
      message: "Gemini took too long to respond. Try a shorter problem description and retry."
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
    message: "Something went wrong - please try again."
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
    const body = (await request.json()) as unknown;
    const input = solveInputSchema.parse(body);

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
    const validated = SolveOutputSchema.parse(parsedJson);

    // ✅ CHANGE 2: added dontDoThis to normalized output
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
          error: "Invalid request payload.",
          details: error.flatten()
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
