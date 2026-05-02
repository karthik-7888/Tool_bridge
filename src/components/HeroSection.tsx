import { GoogleAuthButton } from "@/components/GoogleAuthButton";

export function HeroSection() {
  const googleAuthEnabled = process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true";

  return (
    <section className="relative overflow-hidden border-b border-gray-200/80 dark:border-gray-800/80">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.12),transparent_40%),radial-gradient(circle_at_top_right,rgba(148,163,184,0.18),transparent_35%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(129,140,248,0.18),transparent_40%),radial-gradient(circle_at_top_right,rgba(51,65,85,0.35),transparent_40%)]" />
      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.9fr] lg:items-center">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600 dark:text-indigo-400">
              Assignment Input
            </p>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl">
              Paste the problem or attach the files you have
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-gray-600 dark:text-gray-300 sm:text-lg">
              Type the issue, upload an assignment PDF, or add an error screenshot. Use whichever is fastest for the lab problem in front of you.
            </p>
          </div>

          <div className="rounded-3xl border border-gray-200/70 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-gray-800/80 dark:bg-gray-950/85 dark:shadow-[0_24px_80px_rgba(2,6,23,0.55)] sm:p-7">
            <div className="max-w-sm">
              <p className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
                Sign in to continue
              </p>
              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                Save your progress and access your uploaded assignments anytime.
              </p>
            </div>
            <GoogleAuthButton enabled={googleAuthEnabled} />
            <p className="mt-4 text-sm leading-6 text-gray-500 dark:text-gray-400">
              No password required. We only use Google for secure authentication.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
