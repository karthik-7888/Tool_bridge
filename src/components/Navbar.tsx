import { getServerSession } from "next-auth";
import Link from "next/link";

import { authOptions } from "@/auth";
import { SignOutButton } from "@/components/SignOutButton";

function getInitials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || "TB";

  return source
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export async function Navbar() {
  const session = await getServerSession(authOptions);
  const userName = session?.user?.name ?? null;
  const userEmail = session?.user?.email ?? null;

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

        <nav className="flex items-center gap-3">
          <Link
            href="/about"
            className="rounded-full px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-gray-950 dark:text-gray-200 dark:hover:bg-gray-900 dark:hover:text-white"
          >
            About
          </Link>

          {session?.user ? (
            <div className="flex items-center gap-3 rounded-full border border-gray-200 bg-white px-3 py-2 dark:border-gray-800 dark:bg-gray-950">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white dark:bg-indigo-500">
                {getInitials(userName, userEmail)}
              </span>
              <div className="hidden min-w-0 sm:block">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                  {userName || "Signed in"}
                </p>
                <p className="truncate text-xs text-gray-500 dark:text-gray-400">{userEmail}</p>
              </div>
              <SignOutButton className="rounded-full px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-gray-950 dark:text-gray-200 dark:hover:bg-gray-900 dark:hover:text-white" />
            </div>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
