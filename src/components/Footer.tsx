import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">ToolBridge</p>
            <p className="mt-2 text-sm leading-7 text-gray-600 dark:text-gray-300">
              ToolBridge - Instant EDA tool help for EE/ECE students.
            </p>
          </div>
          <div className="flex gap-5 text-sm text-gray-600 dark:text-gray-300">
            <Link href="/" className="transition hover:text-indigo-600 dark:hover:text-indigo-400">
              Home
            </Link>
            <Link href="/about" className="transition hover:text-indigo-600 dark:hover:text-indigo-400">
              About
            </Link>
            <a href="mailto:hello@toolbridge.study" className="transition hover:text-indigo-600 dark:hover:text-indigo-400">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
