# AGENTS Context

## Project Snapshot

- Stack: Next.js app router, TypeScript, Prisma, PostgreSQL, NextAuth
- Workspace root: `D:\Projects\Mixed\AcademyWeb`
- Main brand: AEC / Academy English Center

## Working Rules

- Prefer small, local edits over broad rewrites
- Use Prisma for data access and server actions for mutations
- Keep the public site aligned to the AEC brand system
- Preserve existing component patterns unless a task explicitly asks for a redesign

## Important Paths

- App routes: `src/app/`
- Shared layout/ui: `src/lib/layout/`
- Prisma schema: `prisma/schema.prisma`
- Seed data: `seed.ts`
- Static assets: `public/logos/`

## Data Notes

- Sponsors are stored in the database, not hardcoded in the UI
- Admin account management is handled inside `src/app/(admin)/admin/accounts/`
- The login page is login-only; account creation is admin-controlled

## Environment

- Local secrets should live in `.env`
- Use `.env.example` as the template for required variables
- Current required variable: `DATABASE_URL`

## Validation

- Prefer linting the touched files after edits
- If Prisma changes are involved, verify with a real query or script when possible