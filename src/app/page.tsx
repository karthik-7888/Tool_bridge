"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useRef, useState } from "react";

import { ExampleQuestions } from "@/components/ExampleQuestions";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { HistoryPanel } from "@/components/HistoryPanel";
import { Navbar } from "@/components/Navbar";
import { OutputSection } from "@/components/OutputSection";
import { ToolForm } from "@/components/ToolForm";
import { getToolById } from "@/lib/tools";
import type { SavedHistoryItem, SolveOutput, ToolId, UploadedContextFile } from "@/types";

interface FieldErrors {
  tool: string | null;
  problem: string | null;
  form: string | null;
}

const emptyErrors: FieldErrors = {
  tool: null,
  problem: null,
  form: null
};

export default function HomePage() {
  const [selectedTool, setSelectedTool] = useState<ToolId | "">("");
  const [problem, setProblem] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [assignmentType, setAssignmentType] = useState("");
  const [university, setUniversity] = useState("");
  const [assignmentPdf, setAssignmentPdf] = useState<UploadedContextFile | null>(null);
  const [errorScreenshot, setErrorScreenshot] = useState<UploadedContextFile | null>(null);
  const [showContext, setShowContext] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [historyItems, setHistoryItems] = useState<SavedHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyConfigured, setHistoryConfigured] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>(emptyErrors);
  const [result, setResult] = useState<{
    toolId: ToolId;
    toolName: string;
    response: SolveOutput;
    submittedProblem: string;
  } | null>(null);

  const formSectionRef = useRef<HTMLDivElement | null>(null);
  const outputSectionRef = useRef<HTMLDivElement | null>(null);
  const problemInputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (result) {
      outputSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result]);

  useEffect(() => {
    let cancelled = false;

    async function loadHistory() {
      try {
        setHistoryLoading(true);
        const response = await fetch("/api/history", { cache: "no-store" });
        const data = (await response.json()) as {
          configured?: boolean;
          items?: SavedHistoryItem[];
        };

        if (cancelled) {
          return;
        }

        setHistoryConfigured(Boolean(data.configured));
        setHistoryItems(data.items ?? []);
      } catch {
        if (!cancelled) {
          setHistoryConfigured(false);
          setHistoryItems([]);
        }
      } finally {
        if (!cancelled) {
          setHistoryLoading(false);
        }
      }
    }

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function saveHistory() {
      if (!result) {
        return;
      }

      try {
        const response = await fetch("/api/history", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            toolId: result.toolId,
            toolName: result.toolName,
            problem: result.submittedProblem,
            response: result.response
          })
        });

        if (!response.ok) {
          return;
        }

        const refreshed = await fetch("/api/history", { cache: "no-store" });
        const data = (await refreshed.json()) as {
          configured?: boolean;
          items?: SavedHistoryItem[];
        };

        if (!cancelled) {
          setHistoryConfigured(Boolean(data.configured));
          setHistoryItems(data.items ?? []);
        }
      } catch {
        // Keep the main solve flow successful even if history persistence is unavailable.
      }
    }

    saveHistory();

    return () => {
      cancelled = true;
    };
  }, [result]);

  async function readFileAsDataUrl(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
      reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
      reader.readAsDataURL(file);
    });
  }

  async function buildUploadedFile(file: File): Promise<UploadedContextFile> {
    const dataUrl = await readFileAsDataUrl(file);

    return {
      name: file.name,
      mimeType: file.type as UploadedContextFile["mimeType"],
      dataUrl,
      size: file.size
    };
  }

  async function handleAssignmentPdfChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (file.type !== "application/pdf") {
      setErrors((current) => ({ ...current, form: "Assignment upload supports PDF files only." }));
      return;
    }

    if (file.size > 8_000_000) {
      setErrors((current) => ({ ...current, form: "Assignment PDF must be smaller than 8 MB." }));
      return;
    }

    try {
      const uploaded = await buildUploadedFile(file);
      setAssignmentPdf(uploaded);
      setErrors((current) => ({ ...current, form: null }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not attach the assignment PDF.";
      setErrors((current) => ({ ...current, form: message }));
    }
  }

  async function handleErrorScreenshotChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!["image/png", "image/jpeg"].includes(file.type)) {
      setErrors((current) => ({ ...current, form: "Error screenshot supports PNG, JPG, and JPEG only." }));
      return;
    }

    if (file.size > 4_000_000) {
      setErrors((current) => ({ ...current, form: "Error screenshot must be smaller than 4 MB." }));
      return;
    }

    try {
      const uploaded = await buildUploadedFile(file);
      setErrorScreenshot(uploaded);
      setErrors((current) => ({ ...current, form: null }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not attach the error screenshot.";
      setErrors((current) => ({ ...current, form: message }));
    }
  }

  function validate() {
    const nextErrors: FieldErrors = { ...emptyErrors };

    if (!selectedTool) {
      nextErrors.tool = "Select a tool to continue.";
    }

    const trimmedProblem = problem.trim();
    const hasAttachment = Boolean(assignmentPdf || errorScreenshot);

    if (!trimmedProblem && !hasAttachment) {
      nextErrors.problem = "Add a problem description or attach a PDF/screenshot before submitting.";
    } else if (trimmedProblem.length > 0 && trimmedProblem.length < 20 && !hasAttachment) {
      nextErrors.problem = "Please add a little more detail. Minimum 20 characters.";
    }

    setErrors(nextErrors);
    return !nextErrors.tool && !nextErrors.problem;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validate() || !selectedTool) {
      return;
    }

    setIsSubmitting(true);
    setErrors(emptyErrors);

    try {
      const trimmedProblem = problem.trim();
      const hasAttachment = Boolean(assignmentPdf || errorScreenshot);
      const normalizedProblem =
        trimmedProblem.length >= 20
          ? trimmedProblem
          : hasAttachment
            ? `${trimmedProblem || "Attached files only."} Please analyze the uploaded assignment PDF or error screenshot and use that as the main context for the answer.`
            : "Please analyze the attached assignment PDF or error screenshot and explain the likely issue and the best first steps.";

      const response = await fetch("/api/solve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          tool: selectedTool,
          problem: normalizedProblem,
          errorMessage: errorMessage.trim() || undefined,
          assignmentType: assignmentType || undefined,
          university: university || undefined,
          assignmentPdf: assignmentPdf || undefined,
          errorScreenshot: errorScreenshot || undefined
        })
      });

      const data = (await response.json()) as SolveOutput | { error?: string };

      if (!response.ok || !("summary" in data)) {
        throw new Error("error" in data && data.error ? data.error : "Something went wrong - please try again.");
      }

      const toolName = getToolById(selectedTool)?.name ?? "Selected Tool";
      setResult({ toolId: selectedTool, toolName, response: data, submittedProblem: normalizedProblem });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong - please try again.";
      setErrors((current) => ({ ...current, form: message }));
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleExampleSelect(toolId: ToolId, question: string) {
    setSelectedTool(toolId);
    setProblem(question);
    setErrors(emptyErrors);

    formSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => {
      problemInputRef.current?.focus();
      problemInputRef.current?.setSelectionRange(question.length, question.length);
    }, 250);
  }

  function handleFollowUp() {
    setProblem((currentProblem) => {
      const source = currentProblem.trim();
      return source ? `${source}\n\nFollow-up question: ` : "Follow-up question: ";
    });
    formSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setShowContext(true);
    window.setTimeout(() => {
      problemInputRef.current?.focus();
      const nextLength = problemInputRef.current?.value.length ?? 0;
      problemInputRef.current?.setSelectionRange(nextLength, nextLength);
    }, 250);
  }

  function handleReuseHistoryItem(item: SavedHistoryItem) {
    setSelectedTool(item.toolId as ToolId);
    setProblem(item.problem);
    setResult({
      toolId: item.toolId as ToolId,
      toolName: item.toolName,
      response: item.response,
      submittedProblem: item.problem
    });
    setErrors(emptyErrors);
    formSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <main className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <Navbar />
      <HeroSection />

      <div ref={formSectionRef}>
        <ToolForm
          selectedTool={selectedTool}
          problem={problem}
          errorMessage={errorMessage}
          assignmentType={assignmentType}
          university={university}
          assignmentPdf={assignmentPdf}
          errorScreenshot={errorScreenshot}
          problemInputRef={problemInputRef}
          isSubmitting={isSubmitting}
          formError={errors.form}
          toolError={errors.tool}
          problemError={errors.problem}
          showContext={showContext}
          onSelectTool={setSelectedTool}
          onProblemChange={setProblem}
          onErrorMessageChange={setErrorMessage}
          onAssignmentTypeChange={setAssignmentType}
          onUniversityChange={setUniversity}
          onAssignmentPdfChange={handleAssignmentPdfChange}
          onErrorScreenshotChange={handleErrorScreenshotChange}
          onClearAssignmentPdf={() => setAssignmentPdf(null)}
          onClearErrorScreenshot={() => setErrorScreenshot(null)}
          onToggleContext={() => setShowContext((current) => !current)}
          onSubmit={handleSubmit}
        />
      </div>

      <ExampleQuestions onSelectExample={handleExampleSelect} />
      <HistoryPanel
        items={historyItems}
        loading={historyLoading}
        configured={historyConfigured}
        onReuse={handleReuseHistoryItem}
      />

      {result ? (
        <div ref={outputSectionRef}>
          <OutputSection
            toolName={result.toolName}
            response={result.response}
            problem={result.submittedProblem}
            onFollowUp={handleFollowUp}
          />
        </div>
      ) : null}

      <Footer />
    </main>
  );
}
