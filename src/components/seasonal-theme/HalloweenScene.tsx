import styles from "./HalloweenScene.module.css";

export function PumpkinBadge() {
  return <svg viewBox="0 0 64 60" width="28" height="28" aria-hidden="true">
    <path d="M32 13q-2-9 7-11" fill="none" stroke="#587a48" strokeWidth="5" strokeLinecap="round" />
    <path d="M32 15C9 4 1 27 8 44q6 15 24 11 18 4 24-11c7-17-1-40-24-29" fill="#F68D2E" />
    <path d="m17 30 8-5 2 9m10 0 2-9 8 5M22 42q10 10 20 0" fill="#40245f" stroke="#40245f" strokeWidth="2" strokeLinecap="round" />
  </svg>;
}

/** Original SVG illustration; no image downloads or runtime drawing library. */
export function HalloweenScene() {
  return <div className={styles.scene} aria-hidden="true">
    <svg viewBox="0 0 480 460" className={styles.art}>
      <circle className={styles.moonHalo} cx="254" cy="195" r="165" />
      <circle className={styles.moon} cx="254" cy="177" r="116" />
      <g fill="#dfc4a6" opacity=".4"><circle cx="205" cy="122" r="18" /><circle cx="316" cy="162" r="11" /><circle cx="237" cy="222" r="25" /></g>
      <g className={styles.stars} fill="#FFF7ED"><path d="m93 100 4 10 10 4-10 4-4 10-4-10-10-4 10-4Zm300 132 3 8 8 3-8 3-3 8-3-8-8-3 8-3ZM362 58l3 7 7 3-7 3-3 7-3-7-7-3 7-3Z" /><circle cx="134" cy="51" r="2" /><circle cx="418" cy="124" r="2" /></g>
      <g className={styles.farBat} fill="#3d2a56"><path d="M322 89q-14-18-31-8l12 14q5-6 12 1l7 5 7-5q7-7 12-1l12-14q-17-10-31 8" /></g>
      <g className={styles.nearBat} fill="#3d2a56"><path d="M116 175q-17-22-39-10l15 17q7-7 15 2l9 6 9-6q8-9 15-2l15-17q-22-12-39 10" /></g>
      <ellipse cx="243" cy="405" rx="172" ry="19" fill="#0d0917" opacity=".4" />
      <path d="M185 313q-4-30 20-37" fill="none" stroke="#6f9152" strokeWidth="13" strokeLinecap="round" />
      <g className={styles.pumpkin}>
        <path d="M190 316c-64-30-107 16-98 56 7 35 49 48 98 37 49 11 91-2 98-37 9-40-34-86-98-56" fill="#F68D2E" />
        <ellipse cx="190" cy="361" rx="48" ry="52" fill="#f9a34e" />
        <path d="M172 315q-42 44-9 92m45-92q42 44 9 92" fill="none" stroke="#d96b26" strokeWidth="3" opacity=".7" />
        <g className={styles.face} fill="#FFF0B2"><path d="m132 351 24-13 8 24Zm84 11 8-24 24 13ZM145 377q45 34 90 0-4 26-45 26t-45-26" /></g>
      </g>
      <g className={styles.ghost}>
        <path d="M279 317v-53c0-53 82-59 85-3l1 62-17-9-17 12-17-12-18 10Z" fill="#FFF7ED" />
        <ellipse cx="305" cy="271" rx="5" ry="8" fill="#40245f" /><ellipse cx="337" cy="271" rx="5" ry="8" fill="#40245f" />
        <path d="M315 290q8 10 15-1" fill="none" stroke="#40245f" strokeWidth="3" strokeLinecap="round" />
        <ellipse cx="296" cy="286" rx="8" ry="4" fill="#f9b5a1" /><ellipse cx="347" cy="286" rx="8" ry="4" fill="#f9b5a1" />
      </g>
      <path d="M350 390q-17-17-12-36 16 4 17 21 5-27 24-29 5 23-20 44" fill="#8B5CF6" />
      <path d="M98 392q-23-20-19-40 22 4 24 24 5-18 20-17 1 20-25 33" fill="#7953b9" />
      <path d="m267 390 14-6 12 19-14 6Z" fill="#ffe5b4" /><path d="m275 388 7 17" stroke="#f68d2e" strokeWidth="6" />
    </svg>
    <span className={styles.caption}>Một chút kỳ diệu. Thật nhiều khám phá.</span>
  </div>;
}
