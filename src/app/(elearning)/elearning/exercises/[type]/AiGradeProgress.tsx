"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AiGradeProgress({ pending }: { pending: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (!pending) return;
    const timer = window.setInterval(() => router.refresh(), 3000);
    return () => window.clearInterval(timer);
  }, [pending, router]);

  return null;
}
