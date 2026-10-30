"use client";

import styles from "./SeasonalDecorations.module.css";
import { HalloweenInteractions } from "./HalloweenInteractions";
import { usePathname } from "next/navigation";

export type SeasonalTheme = "default" | "halloween" | "christmas";

type SeasonalDecorationsProps = {
  theme: SeasonalTheme;
  effectsEnabled: boolean;
};

function Pumpkin() {
  return (
    <svg className={styles.pumpkin} viewBox="0 0 120 108" aria-hidden="true">
      <path className={styles.pumpkinStem} d="M58 20c-2-10 1-16 11-18-4 7-4 12-2 18" />
      <path className={styles.pumpkinBody} d="M61 22C31 9 9 35 13 68c3 27 21 38 48 34 27 4 45-7 48-34 4-33-18-59-48-46Z" />
      <path className={styles.pumpkinRib} d="M61 22C39 35 36 91 61 102M61 22c22 13 25 69 0 80" />
      <path className={styles.pumpkinFace} d="m32 62 13-13 8 15Zm35 2 8-15 13 13ZM42 78q19 16 37 0-3 17-18 17T42 78Z" />
    </svg>
  );
}

function Spiderweb() {
  return (
    <svg className={styles.web} viewBox="0 0 150 150" aria-hidden="true">
      <path d="M149 1H1M149 1v148M149 1 31 31 1 149M149 1 85 43 43 85 1 149M149 1 107 65 65 107 1 149" />
      <path d="M31 31q13 15 12 54M85 43q12 9 22 22M43 85q10 13 22 22M107 65q-6 20-42 42M149 85q-17-3-42-20M85 149q3-17-20-42" />
    </svg>
  );
}

function Bat({ secondary = false }: { secondary?: boolean }) {
  return (
    <svg className={secondary ? styles.batSecondary : styles.bat} viewBox="0 0 100 50" aria-hidden="true">
      <path d="M50 12 44 3l-4 9C26 1 10 8 2 25c10-5 16-3 18 7 6-6 13-5 17 3 4-4 8-4 13 3 5-7 9-7 13-3 4-8 11-9 17-3 2-10 8-12 18-7C90 8 74 1 60 12l-4-9-6 9Z" />
    </svg>
  );
}

function ChristmasTree() {
  return (
    <svg className={styles.tree} viewBox="0 0 130 154" aria-hidden="true">
      <path className={styles.treeTrunk} d="M58 120h14v30H58z" />
      <path className={styles.treeFoliage} d="M65 13 30 62h16L20 105h19l-16 28h84l-16-28h19L84 62h16Z" />
      <path className={styles.treeTier} d="M30 62h70M20 105h90" />
      <path className={styles.treeStar} d="m65 1 4 9 10 1-7 7 2 10-9-5-9 5 2-10-7-7 10-1Z" />
      <circle className={styles.baubleRed} cx="48" cy="72" r="5" />
      <circle className={styles.baubleLight} cx="78" cy="88" r="5" />
      <circle className={styles.baubleRed} cx="54" cy="117" r="5" />
      <circle className={styles.baubleLight} cx="89" cy="117" r="5" />
    </svg>
  );
}

function Gift() {
  return (
    <svg className={styles.gift} viewBox="0 0 100 95" aria-hidden="true">
      <path className={styles.giftBody} d="M13 38h74v52H13z" />
      <path className={styles.giftLid} d="M8 29h84v17H8z" />
      <path className={styles.giftRibbon} d="M43 29h14v61H43z" />
      <path className={styles.giftBow} d="M50 28C32 8 17 10 21 22c2 7 15 9 29 6Zm0 0C68 8 83 10 79 22c-2 7-15 9-29 6Z" />
    </svg>
  );
}

export function SeasonalDecorations({ theme, effectsEnabled }: SeasonalDecorationsProps) {
  const pathname = usePathname();
  if (theme === "default") return null;
  // Public pages have their own quieter, content-aware Halloween scene.
  if (theme === "halloween" && !pathname.startsWith("/management") && !pathname.startsWith("/elearning")) {
    return <HalloweenInteractions enabled={effectsEnabled} />;
  }

  return (
    <><div
      className={`${styles.canvas} ${theme === "halloween" ? styles.halloween : styles.christmas} ${effectsEnabled ? styles.motion : ""}`}
      aria-hidden="true"
    >
      {theme === "halloween" ? (
        <>
          <Spiderweb />
          <div className={styles.fog}><span /><span /></div>
          <div className={styles.embers}>{Array.from({ length: 10 }, (_, i) => <span key={i} style={{ left: `${4 + i * 10}%`, animationDelay: `${-i * 1.7}s` }} />)}</div>
          <Bat />
          <Bat secondary />
          <Pumpkin />
        </>
      ) : (
        <>
          <ChristmasTree />
          <Gift />
          <div className={styles.snow}>
            {Array.from({ length: 12 }, (_, index) => (
              <span className={styles.snowflake} key={index} />
            ))}
          </div>
        </>
      )}
    </div>
    {theme === "halloween" && <HalloweenInteractions enabled={effectsEnabled} />}
    </>
  );
}
