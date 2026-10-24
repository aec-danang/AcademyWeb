# Maintenance Guide

This project is set up to run for long periods without code changes. This page covers the few things that still need a human.

## What runs automatically

| What | Where | When |
| --- | --- | --- |
| Typecheck, lint, compile-only build, `pnpm audit --audit-level high` | `.github/workflows/ci.yml` | Every push/PR to `main`, and weekly (Mon 03:00 UTC) |
| Live-site smoke test (`scripts/smoke.mjs`) | same workflow, `smoke` job | Weekly and on `main`, once the `SMOKE_BASE_URL` repo variable is set |
| Security update PRs | Dependabot (GitHub default) | As advisories appear |
| Grouped minor/patch update PRs | `.github/dependabot.yml` | Monthly, max 3 open |

A failing weekly CI run is your signal that something needs attention. GitHub emails the repo owner by default.

## One-time setup checklist

- [ ] **Rotate the Cloudinary API secret.** An old secret was hardcoded in `src/lib/storage/cloudinary.provider.ts` and is still in git history. Create a new key in the Cloudinary console, update `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` in Vercel, then delete the old key.
- [ ] Set the repository variable `SMOKE_BASE_URL` (Settings → Secrets and variables → Actions → Variables) to the production URL.
- [ ] In GitHub Settings → Code security, enable **Dependabot alerts** and **Dependabot security updates**.
- [ ] Mark the Prisma baseline as applied on the production database (once):
  ```bash
  pnpm prisma migrate resolve --applied 0_init
  ```
  Then `pnpm prisma migrate status` should report the database is up to date.
- [ ] Vercel: confirm all variables from `.env.example` are set for Production, and turn on deployment-failure notifications.
- [ ] Neon: confirm point-in-time restore retention fits your needs (Project → Settings → Storage).

## Handling a Dependabot PR

1. Wait for CI to go green.
2. Open the Vercel preview deployment and click through `/`, `/login`, and one `/management` page.
3. Merge. Vercel deploys `main` automatically.

Major version bumps are ignored on purpose. Do them deliberately, one at a time, using the framework's upgrade guide.

`pnpm-workspace.yaml` sets `minimumReleaseAge` (3 days). pnpm refuses package versions newer than that, which protects against freshly published malicious releases. If an urgent security fix is newer than 3 days, install it explicitly and note it in the commit.

## Changing the database schema

1. Edit `prisma/schema.prisma`.
2. `pnpm prisma migrate dev --name <change>` against a Neon **branch**, never production.
3. Commit the generated folder under `prisma/migrations/`.
4. After deploying, run `pnpm prisma migrate deploy` against production.

`prisma/legacy/` holds a historical one-off SQL script that has already been applied. Do not run it.

## Rotating secrets

| Secret | How |
| --- | --- |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32`, update in Vercel, redeploy. All users are signed out. |
| Neon password | Neon console → Roles → reset, update `NEON_DATABASE_URL` in Vercel, redeploy. |
| Cloudinary | Create a new API key, update Vercel, redeploy, delete the old key. |
| `OPENAI_API_KEY` | Create a new key in the OpenAI dashboard, update Vercel, revoke the old one. |

## Restoring the database

Neon → your project → Branches → **Restore** (point in time), or create a branch from a past timestamp and repoint `NEON_DATABASE_URL` at it.

## Known accepted risks

- `pnpm audit` reports one moderate issue in `postcss-selector-parser`, pulled in by `@tailwindcss/typography`. It only runs at build time on trusted CSS. It will clear when the typography plugin updates its dependency.
