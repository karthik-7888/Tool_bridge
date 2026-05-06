"use client";

import type { FormEvent } from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FeedbackPanelProps {
  toolId: string;
  toolName: string;
  problem: string;
  summary: string;
}

export function FeedbackPanel({ toolId, toolName, problem, summary }: FeedbackPanelProps) {
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedFeedback = feedback.trim();

    if (!trimmedFeedback || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          toolId,
          toolName,
          problem,
          summary,
          feedback: trimmedFeedback
        })
      });

      const data = (await response.json()) as { error?: string; configured?: boolean };

      if (!response.ok) {
        throw new Error(data.error ?? "Could not submit feedback right now.");
      }

      if (data.configured === false) {
        setMessage("Feedback storage is not configured yet.");
        return;
      }

      setSubmitted(true);
      setFeedback("");
      setMessage("Thanks - feedback submitted.");
    } catch (error) {
      const nextMessage = error instanceof Error ? error.message : "Could not submit feedback right now.";
      setMessage(nextMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="mt-10 border-sky-200 bg-sky-50/80 dark:border-sky-950 dark:bg-sky-950/20">
      <CardHeader>
        <CardTitle>Help improve ToolBridge</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <p className="text-sm leading-7 text-gray-700 dark:text-gray-200">
              Found something missing, unclear, or wrong? Share it here.
            </p>
          </div>
          <textarea
            value={feedback}
            onChange={(event) => {
              setFeedback(event.target.value);
              if (message) {
                setMessage(null);
              }
            }}
            rows={4}
            placeholder="Example: The steps were useful, but I still needed a clearer explanation of where to set the model library path in ADE."
            className="min-h-[132px] w-full rounded-2xl border border-sky-200 bg-white px-4 py-3 text-sm leading-7 text-gray-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:border-sky-900 dark:bg-gray-950 dark:text-gray-100 dark:focus:border-sky-400 dark:focus:ring-sky-900"
            disabled={isSubmitting || submitted}
          />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {message ?? "Your feedback goes directly into the improvement backlog."}
            </p>
            <Button type="submit" disabled={isSubmitting || submitted || !feedback.trim()}>
              {submitted ? "Feedback received" : isSubmitting ? "Saving..." : "Send feedback"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
