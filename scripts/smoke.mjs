// Minimal uptime check: every public route must answer 200 and admin must not be open.
// Usage: SMOKE_BASE_URL=https://example.com node scripts/smoke.mjs
const base = process.env.SMOKE_BASE_URL?.replace(/\/$/, "");
if (!base) {
  console.error("SMOKE_BASE_URL is not set");
  process.exit(1);
}

const checks = [
  { path: "/api/ping", expect: (r) => r.status === 200 },
  { path: "/", expect: (r) => r.status === 200 },
  { path: "/programs", expect: (r) => r.status === 200 },
  { path: "/posts", expect: (r) => r.status === 200 },
  { path: "/news", expect: (r) => r.status === 200 },
  { path: "/contact", expect: (r) => r.status === 200 },
  { path: "/login", expect: (r) => r.status === 200 },
  // Signed-out visitors must be bounced to /login, never shown the dashboard.
  { path: "/management", expect: (r) => r.status >= 300 && r.status < 400 && /\/login/.test(r.headers.get("location") ?? "") },
  // Demo role switching must be disabled in production.
  { path: "/api/elearning/demo-role?role=ADMIN", expect: (r) => r.status === 404 },
];

let failed = 0;
for (const { path, expect } of checks) {
  try {
    const res = await fetch(base + path, { redirect: "manual", signal: AbortSignal.timeout(20_000) });
    const ok = expect(res);
    if (!ok) failed++;
    console.log(`${ok ? "ok  " : "FAIL"} ${res.status} ${path}`);
  } catch (error) {
    failed++;
    console.log(`FAIL ---  ${path} (${error.message})`);
  }
}

process.exit(failed ? 1 : 0);
