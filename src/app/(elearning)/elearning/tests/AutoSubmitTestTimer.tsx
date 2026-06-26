"use client";

import { useEffect, useState } from "react";

type AutoSubmitTestTimerProps = {
  seconds: number;
  submitButtonId: string;
  autoSubmitInputId: string;
};

export default function AutoSubmitTestTimer({ seconds, submitButtonId, autoSubmitInputId }: AutoSubmitTestTimerProps) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (seconds <= 0) return;

    const tick = window.setInterval(() => {
      setRemaining((current) => Math.max(current - 1, 0));
    }, 1000);

    const submitTimer = window.setTimeout(() => {
      const autoSubmitInput = document.getElementById(autoSubmitInputId) as HTMLInputElement | null;
      const submitButton = document.getElementById(submitButtonId) as HTMLButtonElement | null;
      if (autoSubmitInput) autoSubmitInput.value = "true";
      submitButton?.click();
    }, seconds * 1000);

    return () => {
      window.clearInterval(tick);
      window.clearTimeout(submitTimer);
    };
  }, [autoSubmitInputId, seconds, submitButtonId]);

  const minutes = Math.floor(remaining / 60).toString().padStart(2, "0");
  const secs = (remaining % 60).toString().padStart(2, "0");

  return <span>{minutes}:{secs}</span>;
}
