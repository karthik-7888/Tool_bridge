"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

type SignOutButtonProps = {
  className?: string;
};

export function SignOutButton({ className = "" }: SignOutButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleClick() {
    if (isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      await signOut({ callbackUrl: "/" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isSubmitting}
      className={className}
    >
      {isSubmitting ? "Signing out..." : "Sign out"}
    </button>
  );
}
