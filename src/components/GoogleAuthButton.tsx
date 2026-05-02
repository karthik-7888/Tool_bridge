"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

type GoogleAuthButtonProps = {
  enabled: boolean;
};

export function GoogleAuthButton({ enabled }: GoogleAuthButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleClick() {
    if (!enabled || isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      await signIn("google", { callbackUrl: "/" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!enabled || isSubmitting}
      className="mt-6 flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-gray-700 bg-gray-950 px-4 text-sm font-medium text-white shadow-sm transition duration-200 hover:border-indigo-500/70 hover:bg-gray-900 hover:shadow-[0_12px_30px_rgba(79,70,229,0.18)] disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0">
        <path fill="#4285F4" d="M21.35 11.1H12v2.98h5.35c-.23 1.48-1.06 2.73-2.26 3.57v2.97h3.66c2.14-1.97 3.37-4.88 3.37-8.32 0-.73-.07-1.44-.2-2.12Z" />
        <path fill="#34A853" d="M12 21.8c2.7 0 4.97-.89 6.63-2.41l-3.66-2.97c-1.02.68-2.33 1.08-3.97 1.08-3.05 0-5.63-2.06-6.55-4.82H.67v3.04A10 10 0 0 0 12 21.8Z" />
        <path fill="#FBBC05" d="M5.45 12.68A6 6 0 0 1 5.08 10c0-.93.16-1.83.37-2.68V4.28H.67A10 10 0 0 0 0 10c0 1.61.38 3.13 1.05 4.4l4.4-3.72Z" />
        <path fill="#EA4335" d="M12 3.98c1.47 0 2.8.5 3.84 1.49l2.88-2.88C16.96.96 14.69 0 12 0A10 10 0 0 0 .67 4.28l4.78 3.04c.92-2.76 3.5-4.82 6.55-4.82Z" />
      </svg>
      <span>{isSubmitting ? "Redirecting..." : "Continue with Google"}</span>
    </button>
  );
}
