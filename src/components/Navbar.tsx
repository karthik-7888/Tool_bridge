import Link from "next/link";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200/80 bg-white/90 backdrop-blur dark:border-gray-800/80 dark:bg-gray-950/90">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 text-sm font-semibold tracking-tight text-gray-900 dark:text-gray-100">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-base text-white shadow-soft dark:bg-indigo-500">
            TB
          </span>
          <span>
            ToolBridge
            <span className="block text-xs font-normal text-gray-500 dark:text-gray-400">
              Bridge the gap between theory and EDA tools.
            </span>
          </span>
        </Link>

        <nav>
          <Link
            href="/about"
            className="rounded-full px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-gray-950 dark:text-gray-200 dark:hover:bg-gray-900 dark:hover:text-white"
          >
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}
