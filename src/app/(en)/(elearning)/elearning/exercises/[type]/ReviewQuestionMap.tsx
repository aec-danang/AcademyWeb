"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import styles from "../../elearning.module.css";

type FloatingStyle = CSSProperties & {
  "--review-map-left"?: string;
  "--review-map-width"?: string;
  "--review-map-height"?: string;
};

function currentScrollTop() {
  return (
    document.scrollingElement?.scrollTop ||
    document.documentElement.scrollTop ||
    document.body.scrollTop ||
    window.scrollY ||
    0
  );
}

export default function ReviewQuestionMap({ children }: { children: ReactNode }) {
  const slotRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const [isFloating, setIsFloating] = useState(false);
  const [floatingStyle, setFloatingStyle] = useState<FloatingStyle>({});

  useEffect(() => {
    let animationFrame = 0;

    const updatePosition = () => {
      animationFrame = 0;
      const slot = slotRef.current;
      const panel = panelRef.current;
      if (!slot || !panel) return;

      const slotRect = slot.getBoundingClientRect();
      const scrollTop = currentScrollTop();
      const dockOffset = 20;
      const slotTop = scrollTop + slotRect.top;
      const shouldFloat = window.innerWidth > 980 && scrollTop >= slotTop - dockOffset;

      setIsFloating(shouldFloat);
      setFloatingStyle({
        "--review-map-left": `${slotRect.left}px`,
        "--review-map-width": `${slotRect.width}px`,
        "--review-map-height": `${panel.offsetHeight}px`,
      });
    };

    const requestUpdate = () => {
      if (animationFrame) return;
      animationFrame = window.requestAnimationFrame(updatePosition);
    };

    updatePosition();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    document.addEventListener("scroll", requestUpdate, { capture: true, passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", requestUpdate);
      document.removeEventListener("scroll", requestUpdate, { capture: true });
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  return (
    <div ref={slotRef} className={styles.reviewSidebarSlot} style={floatingStyle}>
      <aside
        ref={panelRef}
        className={`${styles.reviewSidebar} ${isFloating ? styles.reviewSidebarFloating : ""}`}
      >
        {children}
      </aside>
    </div>
  );
}
