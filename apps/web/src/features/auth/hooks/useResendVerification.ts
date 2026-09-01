import { useEffect, useState } from "react";
import type { ApiResult } from "@lurniva/types";

export function useResendVerification() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCooldownSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const resend = async (email: string) => {
    setIsSubmitting(true);
    setError(null);

    const response = await fetch("/api/auth/resend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const result = (await response.json()) as ApiResult<{ status: string }>;
    setIsSubmitting(false);

    if (!result.success) {
      if (result.error.code === "RATE_LIMITED") {
        const retryAfterSeconds = result.error.details?.retryAfterSeconds;
        setCooldownSeconds(
          typeof retryAfterSeconds === "number" ? retryAfterSeconds : 60,
        );
      } else {
        setError(result.error.message);
      }
      return;
    }

    setCooldownSeconds(60);
  };

  return { resend, isSubmitting, error, cooldownSeconds };
}
