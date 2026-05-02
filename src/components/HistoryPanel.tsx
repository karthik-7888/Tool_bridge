"use client";

import type { SavedHistoryItem } from "@/types";

type HistoryPanelProps = {
  items: SavedHistoryItem[];
  loading: boolean;
  configured: boolean;
  onReuse: (item: SavedHistoryItem) => void;
};

function formatWhen(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Saved recently";
  }

  return date.toLocaleString();
}

export function HistoryPanel({ items, loading, configured, onReuse }: HistoryPanelProps) {
  if (!configured) {
    return null;
  }

  return (
    <section className="mx-auto mt-10 max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950/60">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
              Saved History
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
              Recent signed-in solves
            </h2>
          </div>
          {loading ? <p className="text-sm text-gray-500 dark:text-gray-400">Refreshing history...</p> : null}
        </div>

        {items.length === 0 ? (
          <p className="mt-5 text-sm leading-7 text-gray-600 dark:text-gray-300">
            Once you sign in and run a solve, your recent results will appear here.
          </p>
        ) : (
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onReuse(item)}
                className="rounded-2xl border border-gray-200 bg-gray-50 p-5 text-left transition hover:-translate-y-0.5 hover:border-indigo-400 hover:bg-indigo-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-indigo-500/60 dark:hover:bg-gray-950"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{item.toolName}</p>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{formatWhen(item.createdAt)}</span>
                </div>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600 dark:text-gray-300">{item.problem}</p>
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                  {item.response.summary}
                </p>
                <p className="mt-4 text-sm font-medium text-indigo-600 dark:text-indigo-400">Open this result</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
