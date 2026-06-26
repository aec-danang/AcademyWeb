"use client";

import { useEffect, useState } from "react";

type AutoSubmitTimerProps = {
  formId: string;
  seconds: number;
};

export default function AutoSubmitTimer({ formId, seconds }: AutoSubmitTimerProps) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (seconds <= 0) return;

    const tick = window.setInterval(() => {
      setRemaining((current) => Math.max(current - 1, 0));
    }, 1000);
    const submitTimer = window.setTimeout(() => {
      const form = document.getElementById(formId) as HTMLFormElement | null;
      form?.requestSubmit();
    }, seconds * 1000);

    return () => {
      window.clearInterval(tick);
      window.clearTimeout(submitTimer);
    };
  }, [formId, seconds]);

  const minutes = Math.floor(remaining / 60).toString().padStart(2, "0");
  const secs = (remaining % 60).toString().padStart(2, "0");

  return <span>{minutes}:{secs}</span>;
}
