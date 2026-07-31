"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

interface GsapRevealProps {
  children: React.ReactNode;
  animation?: "fade-up" | "fade-in" | "fade-left" | "fade-right";
  stagger?: number;
  delay?: number;
  className?: string;
  target?: string;
}

export default function GsapReveal({ 
  children, 
  animation = "fade-up", 
  stagger = 0.15,
  delay = 0,
  className = "",
  target = ".gsap-target"
}: GsapRevealProps) {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!container.current) return;

    let fromVars: gsap.TweenVars = { opacity: 0 };
    if (animation === "fade-up") fromVars.y = 30;
    if (animation === "fade-left") fromVars.x = 30;
    if (animation === "fade-right") fromVars.x = -30;

    gsap.fromTo(
      target,
      fromVars,
      {
        y: 0,
        x: 0,
        opacity: 1,
        duration: 1,
        stagger,
        delay,
        ease: "power3.out",
        scrollTrigger: {
          trigger: container.current,
          start: "top 85%",
        }
      }
    );
  }, { scope: container });

  return <div ref={container} className={className}>{children}</div>;
}
