import { supportedTools } from "@/lib/tools";
import type { ToolId } from "@/types";

interface ExampleQuestionsProps {
  onSelectExample: (toolId: ToolId, question: string) => void;
}

export function ExampleQuestions({ onSelectExample }: ExampleQuestionsProps) {
  const examples = supportedTools.map((tool, index) => ({
    toolId: tool.id,
    toolName: tool.name,
    question: tool.commonProblems[(index + 1) % tool.commonProblems.length]
  }));

  return (
    <section className="mx-auto mt-10 max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950/60">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
          Try an example:
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {examples.map((example) => (
            <button
              key={example.toolId}
              type="button"
              onClick={() => onSelectExample(example.toolId, example.question)}
              className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-400 hover:bg-indigo-50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-indigo-500/60 dark:hover:bg-gray-950 dark:hover:shadow-black/20 dark:focus-visible:ring-offset-gray-950"
            >
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{example.toolName}</p>
              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">{example.question}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
