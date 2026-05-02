interface GeminiCandidate {
  content?: {
    parts?: Array<{
      text?: string;
    }>;
  };
}

interface GeminiErrorResponse {
  error?: {
    message?: string;
  };
}

interface GeminiSuccessResponse {
  candidates?: GeminiCandidate[];
  promptFeedback?: {
    blockReason?: string;
  };
}

interface GeminiInlineAttachment {
  mimeType: "application/pdf" | "image/png" | "image/jpeg";
  dataUrl: string;
}

const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models";

function sleep(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function toInlinePart(attachment: GeminiInlineAttachment) {
  const [, base64Data = ""] = attachment.dataUrl.split(",", 2);

  return {
    inlineData: {
      mimeType: attachment.mimeType,
      data: base64Data
    }
  };
}

export async function callGemini(prompt: string, attachments: GeminiInlineAttachment[] = []): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY.");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30_000);

  try {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const response = await fetch(`${GEMINI_ENDPOINT}/${model}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }, ...attachments.map(toInlinePart)]
            }
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 2000,
            responseMimeType: "application/json"
          }
        }),
        signal: controller.signal,
        cache: "no-store"
      });

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as GeminiErrorResponse | null;
        const message = errorBody?.error?.message ?? "Gemini request failed.";

        if (attempt === 0 && message.toLowerCase().includes("high demand")) {
          await sleep(1200);
          continue;
        }

        throw new Error(message);
      }

      const payload = (await response.json()) as GeminiSuccessResponse;
      const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        const blockReason = payload.promptFeedback?.blockReason;
        throw new Error(blockReason ? `Gemini blocked the response: ${blockReason}` : "Gemini returned an empty response.");
      }

      return text;
    }

    throw new Error("Gemini request failed.");
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Gemini request timed out after 30 seconds.");
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
