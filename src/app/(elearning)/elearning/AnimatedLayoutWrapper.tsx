"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export function AnimatedLayoutWrapper({ children }: { children: React.ReactNode }) {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Very simple, subtle fade-in animation for the layout
      gsap.from(container.current, {
        opacity: 0,
        y: 10,
        duration: 0.6,
        ease: "power2.out",
      });
    },
    { scope: container }
  );

  return <div ref={container} style={{ display: "contents" }}>{children}</div>;
}
