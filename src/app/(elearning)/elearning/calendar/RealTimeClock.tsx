"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

export function RealTimeClock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!time) {
    return <div className="h-9 w-32 bg-slate-100 rounded-lg animate-pulse" />;
  }

  const timeString = time.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const dateString = time.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="flex items-center gap-3 bg-white border border-slate-200 shadow-sm rounded-lg px-4 py-2">
      <Clock size={16} className="text-blue-600" />
      <div className="flex flex-col">
        <span className="text-sm font-bold text-slate-900 leading-none tracking-tight">
          {timeString}
        </span>
        <span className="text-[10px] font-medium text-slate-500 leading-none mt-1 uppercase tracking-wider">
          {dateString}
        </span>
      </div>
    </div>
  );
}
