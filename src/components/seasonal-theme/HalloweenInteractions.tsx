"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import styles from "./SeasonalDecorations.module.css";

gsap.registerPlugin(useGSAP);

const controls = 'button, [role="button"], a[href]';
const batShape = "M50 12 44 3l-4 9C26 1 10 8 2 25c10-5 16-3 18 7 6-6 13-5 17 3 4-4 8-4 13 3 5-7 9-7 13-3 4-8 11-9 17-3 2-10 8-12 18-7C90 8 74 1 60 12l-4-9-6 9Z";

/** Decorative feedback only: native pointer, keyboard and click behavior stays intact. */
export function HalloweenInteractions({ enabled }: { enabled: boolean }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!enabled || !root.current) return;
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const glow = root.current!.querySelector<HTMLDivElement>(`.${styles.controlGlow}`)!;
      const burst = root.current!.querySelector<HTMLDivElement>(`.${styles.batBurst}`)!;
      const bats = Array.from(burst.children);
      let target: Element | null = null;
      let pressed: Element | null = null;
      let timer: ReturnType<typeof setTimeout> | undefined;
      let lastFlight = -750;

      // Reuse one timeline and eight SVGs, even after repeated long presses.
      const flight = gsap.timeline({ paused: true });
      bats.forEach((bat, i) => {
        const angle = Math.PI + (i / (bats.length - 1)) * Math.PI;
        flight.fromTo(bat, { x: 0, y: 0, scale: .25, opacity: 0, rotation: 0 }, {
          x: Math.cos(angle) * (90 + i % 3 * 28),
          y: Math.sin(angle) * 100 - 48,
          scale: .8 + i % 3 * .15, opacity: 1, rotation: (i - 3.5) * 10,
          duration: .65, ease: "power2.out",
        }, i * .025).to(bat, { y: "-=38", opacity: 0, duration: .4 }, .65 + i * .025);
      });
      const halo = gsap.fromTo(glow, { opacity: 0, scale: .85 }, {
        opacity: 1, scale: 1, duration: .25, paused: true,
      });

      const controlAt = (node: EventTarget | null) => {
        const element = node instanceof Element ? node.closest(controls) : null;
        return element && !element.matches(':disabled, [aria-disabled="true"], [data-state="disabled"]')
          && !element.closest('[inert], [data-halloween-effects="off"]') ? element : null;
      };
      const reveal = (element: Element) => {
        const rect = element.getBoundingClientRect();
        // Position once on entry, never on every pointermove.
        Object.assign(glow.style, { left: `${rect.left - 8}px`, top: `${rect.top - 8}px`, width: `${rect.width + 16}px`, height: `${rect.height + 16}px` });
        halo.play();
      };
      const cancel = () => { clearTimeout(timer); pressed = null; };
      const hide = () => { cancel(); target = null; halo.reverse(); };
      const scatter = (element: Element) => {
        if (!element.isConnected || document.hidden || performance.now() - lastFlight < 750) return;
        lastFlight = performance.now();
        const rect = element.getBoundingClientRect();
        Object.assign(burst.style, { left: `${rect.left + rect.width / 2}px`, top: `${rect.top + rect.height / 2}px` });
        flight.restart();
      };
      const over = (event: PointerEvent) => {
        if (event.pointerType === "touch") return;
        const next = controlAt(event.target);
        if (next === target) return;
        hide(); target = next;
        if (next) { reveal(next); scatter(next); }
      };
      const out = (event: PointerEvent) => {
        if (target && !(event.relatedTarget instanceof Node && target.contains(event.relatedTarget))) hide();
      };
      const start = (element: Element) => {
        cancel(); pressed = element; reveal(element);
        timer = setTimeout(() => {
          if (pressed !== element || !element.isConnected || document.hidden) return;
          scatter(element);
        }, 420);
      };
      const down = (event: PointerEvent) => {
        if (!event.isPrimary || event.button !== 0) return;
        const element = controlAt(event.target);
        if (element) { start(element); if (event.pointerType === "touch") scatter(element); }
      };
      const up = () => { cancel(); if (!target) halo.reverse(); };
      const key = (event: KeyboardEvent) => {
        if (event.repeat || (event.key !== " " && event.key !== "Enter")) return;
        const element = controlAt(event.target);
        if (element) start(element);
      };
      const focus = (event: FocusEvent) => {
        const element = controlAt(event.target);
        if (element?.matches(":focus-visible")) { reveal(element); scatter(element); }
      };
      document.addEventListener("pointerover", over, { passive: true });
      document.addEventListener("pointerout", out, { passive: true });
      document.addEventListener("pointerdown", down, { passive: true });
      document.addEventListener("pointerup", up, { passive: true });
      document.addEventListener("pointercancel", hide, { passive: true });
      document.addEventListener("keydown", key);
      document.addEventListener("keyup", up);
      document.addEventListener("focusin", focus);
      document.addEventListener("focusout", hide);
      document.addEventListener("scroll", hide, true);
      document.addEventListener("visibilitychange", hide);
      window.addEventListener("blur", hide);
      return () => {
        cancel();
        document.removeEventListener("pointerover", over);
        document.removeEventListener("pointerout", out);
        document.removeEventListener("pointerdown", down);
        document.removeEventListener("pointerup", up);
        document.removeEventListener("pointercancel", hide);
        document.removeEventListener("keydown", key);
        document.removeEventListener("keyup", up);
        document.removeEventListener("focusin", focus);
        document.removeEventListener("focusout", hide);
        document.removeEventListener("scroll", hide, true);
        document.removeEventListener("visibilitychange", hide);
        window.removeEventListener("blur", hide);
      };
    });
    return () => media.revert();
  }, { scope: root, dependencies: [enabled], revertOnUpdate: true });

  return <div ref={root} className={styles.interactions} aria-hidden="true" hidden={!enabled}>
    <div className={styles.controlGlow} />
    <div className={styles.batBurst}>{Array.from({ length: 8 }, (_, i) =>
      <svg key={i} viewBox="0 0 100 50"><path d={batShape} /></svg>
    )}</div>
  </div>;
}
