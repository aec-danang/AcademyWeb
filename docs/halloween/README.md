# Public Halloween theme

Playful, gently mysterious illustration with AEC branding. An authenticated, active admin selects the global theme in `/management/themes` or the admin-only theme menu. The server stores the selection in SiteSetting (`site-seasonal-theme`); visitors cannot override it with local storage or demo-role cookies. The effects button remains a local accessibility preference. Existing tabs refresh the shared theme on focus, navigation or within 60 seconds.

## Implementation

- Original SVG moon, pumpkin, friendly ghost and bats; no added library or remote illustration requests.
- Hovering an enabled button/link releases eight pooled bats from that control, with a 750ms cooldown. Keyboard focus and touch also provide feedback. Public hero includes two slow mist layers, reduced on mobile.
- Hero retains existing copy and registration links. Ghost floats 10px in 5 seconds; lantern cycles over 3.6 seconds.
- At most two edge webs; a narrow edge spider visits every 36 seconds. Mobile uses one smaller web and hides the spider and distant stars/bat.
- GSAP entrances: 16px movement, 650ms duration, 80ms stagger. MatchMedia and useGSAP cleanup handle reduced motion, effect toggles and route changes.
- Program and sponsor counts come from existing database records. Historical dates remain from the project's published history.
- Public pages use their own decorations; workspace Halloween effects remain separate.
- Fixed an existing footer image-error loop: broken partner images fall back to their actual names rather than repeatedly requesting an external placeholder.

## References

- https://halloween.js.org/ — edge placement and occasional dropping spider.
- https://codewithsadee.github.io/halloween/ — friendly illustration composition and restrained seasonal atmosphere.

## Verification

- Viewed homepage before and after at desktop and responsive mobile widths, including middle sections and footer before implementation.
- Exercised mobile navigation, theme selection, effects off/on, CTA navigation to the registration form, and empty-form validation. No real registration submitted.
- Emulated prefers-reduced-motion in browser DevTools.
- TypeScript noEmit passed; targeted ESLint passed. Changed tracked files passed diff whitespace checks.
- HTTP checks: homepage, programs, contact and login returned 200.
- Screenshots: desktop-after.png (desktop viewport), mobile-after.png (400px responsive viewport).
- New authorization checks: anonymous PUT and forged demo-role ADMIN PUT both return 403; GET exposes no admin controls to anonymous users. Legacy site-setting server actions now enforce the same real-admin check.
- New hover verification in the browser was interrupted when the user stopped Computer Use. No authenticated admin session was supplied for a positive persistence test.
- The pre-merge audit of the original feature dependency tree reported 57 findings (2 critical, 13 high). Main subsequently updated dependencies; that count does not describe the merged dependency tree.
- Did not measure Lighthouse, production Core Web Vitals, physical-device performance or successful form delivery. External partner image URLs may still be blocked by browser settings; they now fall back once. Browser dev mode showed font/image preload warnings; no hydration error observed during navigation.

## Main integration verification

- Merged with main at 5a144f6, preserving its dependency versions, management-only dark mode and landing-page database fallbacks.
- Installed main dependencies in an isolated worktree without changing package.json or pnpm-lock.yaml; generated Prisma Client 7.10.1.
- TypeScript noEmit, targeted ESLint, git diff whitespace checks, and Next.js 16.4.2 compile build all passed. Compile mode does not perform the full production generation/deployment step.
- Main package smoke script references a missing scripts/smoke.mjs, so that command was not run. Positive real-admin persistence remains unverified.
