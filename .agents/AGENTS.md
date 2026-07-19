# AGENTS Context

## Project Snapshot

- Stack: Next.js app router, TypeScript, Prisma, PostgreSQL, NextAuth, Vercel, Neon, Cloudflare R2, GitHub
- Workspace root: `D:\Projects\Mixed\AcademyWeb`
- Main brand: AEC / Academy English Center

## Working Rules

- Prefer small, local edits over broad rewrites
- Use Prisma for data access and server actions for mutations
- Keep the public site aligned to the AEC brand system
- Preserve existing component patterns unless a task explicitly asks for a redesign
- **UI/UX Guidelines**: Management pages must have a modern, premium design (e.g., clear container boxes, sleek inputs, good spacing) while strictly retaining the exact original AEC brand fonts and colors.

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
- Current required variable: `NEON_DATABASE_URL`

## Validation

- Prefer linting the touched files after edits
- If Prisma changes are involved, verify with a real query or script when possible

---

# Design System

## Brand

- Brand: Academy English Center (AEC)
- Tone: bright, clean, trustworthy, modern, energetic, student-centered
- Avoid: dark-first UI, childish visuals, overuse of gradients, random icon styles, heavy shadows

## Web Style & Design Philosophy

- **Overall Feel**: Professional educational site
- **Effects**: Not too much animation, avoid clunky and mass effects
- **Backgrounds**: No gradient backgrounds

## Color Tokens

- Primary orange: `#f68d2e`
- Orange hover: `#ea740a`
- Primary navy: `#2c2d65`
- Dark navy: `#1d1e44`
- Light orange background: `#fef4eb`
- Light navy background: `#f0f0f8`
- White: `#ffffff`

## Typography

- Primary font: Montserrat
- Headings: bold navy, with orange emphasis for key words only
- Buttons: bold, high-contrast, highly legible

## Layout

- Use a centered container with a max width around 1200px
- Prefer generous whitespace and card-based sections
- Mobile should collapse to a single column without losing hierarchy

## Components

- Primary CTA: orange pill button
- Secondary CTA: white or navy outline button
- Cards: white background, subtle shadow, rounded corners
- Use the official AEC logo assets from `public/logos/`

## Logo Usage

- Header: horizontal logo
- Footer or intro sections: vertical logo
- Dark sections: inverted logo only
- Do not stretch, recolor, or add effects to the logo