"use client";

import { useState } from "react";

import type { SolveOutput } from "@/types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OutputSectionProps {
  toolName: string;
  response: SolveOutput;
  problem: string;
  onFollowUp: () => void;
}

function buildClipboardText(toolName: string, response: SolveOutput) {
  const stepsText = response.steps
    .map((step) => {
      const command = step.command ? `\nCommand:\n${step.command}` : "";
      return `Step ${step.stepNumber}: ${step.title}\n${step.instructions}${command}`;
    })
    .join("\n\n");

  const dontDoThis = response.dontDoThis?.length
    ? `\nDon't do this first:\n${response.dontDoThis.map((item) => `- ${item}`).join("\n")}\n`
    : "";

  return `${toolName} Step-by-Step Solution

Summary:
${response.summary}
${dontDoThis}
Steps:
${stepsText}

Watch out for these:
${response.commonMistakes.map((item) => `- ${item}`).join("\n")}

You're on track if you see:
${response.checkpoint}

If this didn't help, try:
${response.stillStuck}`;
}

export function OutputSection({ toolName, response, problem, onFollowUp }: OutputSectionProps) {
  const [copiedResponse, setCopiedResponse] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState<number | null>(null);

  async function handleCopyResponse() {
    await navigator.clipboard.writeText(buildClipboardText(toolName, response));
    setCopiedResponse(true);
    window.setTimeout(() => setCopiedResponse(false), 1600);
  }

  async function handleCopyCommand(stepNumber: number, command: string) {
    await navigator.clipboard.writeText(command);
    setCopiedCommand(stepNumber);
    window.setTimeout(() => setCopiedCommand(null), 1600);
  }

  return (
    <section className="mx-auto mt-12 max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
            Structured Output
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
            {toolName} Step-by-Step Solution
          </h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={handleCopyResponse}>
            {copiedResponse ? "Copied" : "Copy full response"}
          </Button>
          <Button variant="secondary" onClick={onFollowUp}>
            Ask a follow-up
          </Button>
        </div>
      </div>

      <Card className="mt-8 border-indigo-100 bg-indigo-50/60 dark:border-indigo-900/60 dark:bg-indigo-500/10">
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-base leading-8 text-gray-700 dark:text-gray-200">{response.summary}</p>
        </CardContent>
      </Card>

      {response.dontDoThis?.length > 0 && (
        <Card className="mt-6 border-red-200 bg-red-50 dark:border-red-950 dark:bg-red-950/30">
          <CardHeader>
            <CardTitle className="text-red-700 dark:text-red-400">Don&apos;t do this first</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <ul className="space-y-3 text-sm leading-7 text-gray-700 dark:text-gray-200">
              {response.dontDoThis.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="mt-10 space-y-5">
        {response.steps.map((step) => (
          <Card key={step.stepNumber} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="grid gap-0 md:grid-cols-[96px_1fr]">
                <div className="flex items-center justify-center border-b border-gray-200 bg-gray-50 px-6 py-8 dark:border-gray-800 dark:bg-gray-900 md:border-b-0 md:border-r">
                  <span className="text-4xl font-semibold text-indigo-600 dark:text-indigo-400">
                    {step.stepNumber}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{step.title}</h3>
                  <p className="mt-4 whitespace-pre-line text-base leading-8 text-gray-700 dark:text-gray-200">
                    {step.instructions}
                  </p>
                  {step.command ? (
                    <div className="mt-5 overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-800">
                      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
                        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                          Exact command
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyCommand(step.stepNumber, step.command ?? "")}
                        >
                          {copiedCommand === step.stepNumber ? "Copied" : "Copy"}
                        </Button>
                      </div>
                      <pre className="overflow-x-auto px-4 py-4 text-sm leading-7 text-gray-900 dark:text-gray-100">
                        <code>{step.command}</code>
                      </pre>
                    </div>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-950 dark:bg-amber-950/30">
          <CardHeader>
            <CardTitle>Watch out for these</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <ul className="space-y-3 text-sm leading-7 text-gray-700 dark:text-gray-200">
              {response.commonMistakes.map((mistake) => (
                <li key={mistake}>- {mistake}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50 dark:border-emerald-950 dark:bg-emerald-950/30">
          <CardHeader>
            <CardTitle>You&apos;re on track if you see...</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-sm leading-7 text-gray-700 dark:text-gray-200">{response.checkpoint}</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-50 dark:bg-gray-900">
          <CardHeader>
            <CardTitle>If this didn&apos;t help, try...</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-sm leading-7 text-gray-700 dark:text-gray-200">{response.stillStuck}</p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
