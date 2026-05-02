"use client";

import type { ChangeEvent, FormEvent, RefObject } from "react";
import { useEffect, useState } from "react";

import { assignmentTypes, supportedTools, universityOptions } from "@/lib/tools";
import { cn } from "@/lib/utils";
import type { ToolId, UploadedContextFile } from "@/types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ToolFormProps {
  selectedTool: ToolId | "";
  problem: string;
  errorMessage: string;
  assignmentType: string;
  university: string;
  assignmentPdf: UploadedContextFile | null;
  errorScreenshot: UploadedContextFile | null;
  problemInputRef: RefObject<HTMLTextAreaElement>;
  isSubmitting: boolean;
  formError: string | null;
  toolError: string | null;
  problemError: string | null;
  showContext: boolean;
  isFollowUp: boolean;
  followUpToolName: string | null;
  onSelectTool: (toolId: ToolId) => void;
  onProblemChange: (value: string) => void;
  onErrorMessageChange: (value: string) => void;
  onAssignmentTypeChange: (value: string) => void;
  onUniversityChange: (value: string) => void;
  onAssignmentPdfChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onErrorScreenshotChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onClearAssignmentPdf: () => void;
  onClearErrorScreenshot: () => void;
  onToggleContext: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

const maxCharacters = 1000;

function getToolInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
}

function FilePill({
  file,
  label,
  onRemove
}: {
  file: UploadedContextFile;
  label: string;
  onRemove: () => void;
}) {
  return (
    <div className="mt-3 flex flex-col gap-2 rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm dark:border-gray-800 dark:bg-gray-950 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-medium text-gray-900 dark:text-gray-100">{file.name}</p>
        <p className="text-gray-500 dark:text-gray-400">
          {Math.max(1, Math.round(file.size / 1024))} KB · {label}
        </p>
      </div>
      <button
        type="button"
        className="text-sm font-medium text-indigo-600 transition hover:text-indigo-500 dark:text-indigo-400"
        onClick={onRemove}
      >
        Remove
      </button>
    </div>
  );
}

export function ToolForm({
  selectedTool,
  problem,
  errorMessage,
  assignmentType,
  university,
  assignmentPdf,
  errorScreenshot,
  problemInputRef,
  isSubmitting,
  formError,
  toolError,
  problemError,
  showContext,
  isFollowUp,
  followUpToolName,
  onSelectTool,
  onProblemChange,
  onErrorMessageChange,
  onAssignmentTypeChange,
  onUniversityChange,
  onAssignmentPdfChange,
  onErrorScreenshotChange,
  onClearAssignmentPdf,
  onClearErrorScreenshot,
  onToggleContext,
  onSubmit
}: ToolFormProps) {
  const remaining = maxCharacters - problem.length;
  const [loadingMessage, setLoadingMessage] = useState("Analyzing your problem...");

  useEffect(() => {
    if (!isSubmitting) {
      setLoadingMessage("Analyzing your problem...");
      return;
    }

    const timers = [
      window.setTimeout(() => setLoadingMessage("Generating step-by-step workflow..."), 5000),
      window.setTimeout(() => setLoadingMessage("Almost there. Complex tool problems can take a moment..."), 12000)
    ];

    return () => {
      timers.forEach(window.clearTimeout);
    };
  }, [isSubmitting]);

  return (
    <section id="tool-form" className="mx-auto mt-12 max-w-6xl px-4 sm:px-6 lg:px-8">
      <Card className="overflow-hidden shadow-soft">
        <CardHeader>
          <CardTitle>{isFollowUp ? "Ask a follow-up" : "The assignment help workflow"}</CardTitle>
          <CardDescription>
            {isFollowUp
              ? `Continue from the last ${followUpToolName ?? "ToolBridge"} answer. Ask what you would ask a senior sitting next to you.`
              : "Select the tool, type the problem if you want, and attach supporting files only when they help."}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form className="space-y-8" onSubmit={onSubmit}>
            <div>
              <div className="flex items-center justify-between gap-3">
                <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">1. Select your tool</label>
                {toolError ? <span className="text-sm text-red-600 dark:text-red-400">{toolError}</span> : null}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3" role="radiogroup" aria-label="EDA tool">
                {supportedTools.map((tool) => {
                  const selected = selectedTool === tool.id;

                  return (
                    <button
                      key={tool.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      aria-label={`Select ${tool.name}`}
                      onClick={() => onSelectTool(tool.id)}
                      className={cn(
                        "rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950 sm:p-5",
                        selected
                          ? "border-indigo-500 bg-indigo-50 shadow-sm dark:border-indigo-400 dark:bg-indigo-500/10"
                          : "border-gray-200 bg-white hover:border-indigo-300 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-950 dark:hover:border-indigo-500/60 dark:hover:bg-gray-900"
                      )}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
                        <div
                          className={cn(
                            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold sm:h-12 sm:w-12",
                            selected
                              ? "bg-indigo-600 text-white dark:bg-indigo-500"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-200"
                          )}
                        >
                          {getToolInitials(tool.name)}
                        </div>
                        <div>
                          <p className="break-words text-sm font-semibold text-gray-900 dark:text-gray-100 sm:text-base">
                            {tool.name}
                          </p>
                          <p className="mt-2 hidden text-sm leading-6 text-gray-600 dark:text-gray-300 sm:block">
                            {tool.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="problem" className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {isFollowUp ? "2. Ask your follow-up question" : "2. Describe your problem"}
                </label>
                <span
                  className={cn(
                    "text-sm",
                    remaining < 0 ? "text-red-600 dark:text-red-400" : "text-gray-500 dark:text-gray-400"
                  )}
                >
                  {problem.length}/{maxCharacters}
                </span>
              </div>
              <textarea
                ref={problemInputRef}
                id="problem"
                value={problem}
                onChange={(event) => onProblemChange(event.target.value.slice(0, maxCharacters))}
                placeholder={
                  isFollowUp
                    ? "Example: I reached step 3 but PSS still does not converge. What should I change first?"
                    : "Type the issue here, or leave this brief and let the PDF / screenshot carry more context."
                }
                className="mt-4 min-h-[120px] w-full rounded-2xl border border-gray-200 bg-white px-4 py-4 text-base leading-7 text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-400/20 sm:min-h-[180px]"
              />
              <div className="mt-2 flex items-center justify-between gap-3">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isFollowUp
                    ? "Short follow-ups are okay because ToolBridge will use the previous answer as context."
                    : "You can submit with typed text, an uploaded file, or both."}
                </p>
                {problemError ? <p className="text-sm text-red-600 dark:text-red-400">{problemError}</p> : null}
              </div>

              <div className="mt-5 rounded-2xl border border-dashed border-gray-300 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-900/50">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Upload assignment PDF</p>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                      Optional. PDF only. Add the assignment sheet if the typed prompt does not capture the full context.
                    </p>
                  </div>
                  <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 transition hover:border-indigo-400 hover:bg-indigo-50 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:hover:border-indigo-500/60 dark:hover:bg-gray-900">
                    <input type="file" accept="application/pdf,.pdf" className="hidden" onChange={onAssignmentPdfChange} />
                    Choose PDF
                  </label>
                </div>
                {assignmentPdf ? <FilePill file={assignmentPdf} label="PDF attached" onRemove={onClearAssignmentPdf} /> : null}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/60">
              <button
                type="button"
                onClick={onToggleContext}
                className="flex w-full items-center justify-between gap-4 rounded-xl px-1 text-left transition hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">3. Add more context</p>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    Optional fields for assignment type, university, exact error text, and screenshots.
                  </p>
                </div>
                <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                  {showContext ? "Hide ^" : "Show v"}
                </span>
              </button>

              {showContext ? (
                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  <div>
                    <label htmlFor="university" className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      University / College
                    </label>
                    <select
                      id="university"
                      value={university}
                      onChange={(event) => onUniversityChange(event.target.value)}
                      className="mt-2 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100 dark:focus:border-indigo-400"
                    >
                      <option value="">Select one</option>
                      {universityOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="assignmentType" className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Assignment type
                    </label>
                    <select
                      id="assignmentType"
                      value={assignmentType}
                      onChange={(event) => onAssignmentTypeChange(event.target.value)}
                      className="mt-2 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100 dark:focus:border-indigo-400"
                    >
                      <option value="">Select one</option>
                      {assignmentTypes.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="errorMessage" className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Exact error message
                    </label>
                    <textarea
                      id="errorMessage"
                      value={errorMessage}
                      maxLength={2000}
                      onChange={(event) => onErrorMessageChange(event.target.value.slice(0, 2000))}
                      placeholder="Paste the raw error text if you have it."
                      className="mt-2 min-h-[120px] w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm leading-7 text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100 dark:focus:border-indigo-400"
                    />
                    <p className="mt-2 text-right text-xs text-gray-500 dark:text-gray-400">
                      {errorMessage.length}/2000
                    </p>

                    <div className="mt-4 rounded-2xl border border-dashed border-gray-300 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-900/50">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Upload error screenshot</p>
                          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                            Optional. PNG, JPG, or JPEG screenshots work best for Cadence, Vivado, Quartus, and ICCAP errors.
                          </p>
                        </div>
                        <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 transition hover:border-indigo-400 hover:bg-indigo-50 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:hover:border-indigo-500/60 dark:hover:bg-gray-900">
                          <input
                            type="file"
                            accept="image/png,image/jpeg,.png,.jpg,.jpeg"
                            className="hidden"
                            onChange={onErrorScreenshotChange}
                          />
                          Choose Image
                        </label>
                      </div>
                      {errorScreenshot ? (
                        <FilePill file={errorScreenshot} label="Screenshot attached" onRemove={onClearErrorScreenshot} />
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {formError ? (
              <div className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-950 dark:bg-red-950/40 dark:text-red-300 sm:flex-row sm:items-center sm:justify-between">
                <span>{formError}</span>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-h-[44px] rounded-xl border border-red-200 bg-white px-4 py-2 font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900/50"
                >
                  Try again
                </button>
              </div>
            ) : null}

            <Button type="submit" size="lg" className="min-h-[48px] w-full sm:w-auto" disabled={isSubmitting}>
              {isSubmitting ? loadingMessage : isFollowUp ? "Send Follow-Up" : "Get Step-by-Step Help"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
