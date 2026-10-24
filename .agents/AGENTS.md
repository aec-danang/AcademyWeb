# AGENTS Context & Architecture Guide

## Project Snapshot

- **Brand:** Academy English Center (AEC) — [academy.edu.vn](https://academy.edu.vn)
- **Stack:** Next.js 16 (App Router, Turbopack), React 19, TypeScript, Prisma 7, PostgreSQL (Neon Serverless), NextAuth.js, Tailwind CSS v4, GSAP, Vercel
- **Workspace root:** `c:\Users\binha\Projects\AcademyWeb`
- **License / Private:** Proprietary Educational System

## Architecture & Directory Layout

```
AcademyWeb/
├── .agents/                    # Agent specifications & skills
│   ├── AGENTS.md               # Source of truth for agents & developers
│   └── skills/                 # Installed Agent Skills (skills.sh)
│       ├── frontend-ui-engineering/
│       ├── hallmark/
│       ├── neon/
│       ├── neon-postgres/
│       └── vercel-doctor/
├── prisma/                     # Database Schema & Migrations
│   ├── schema.prisma           # Prisma schema definition
│   └── migrations/             # SQL migrations
├── public/                     # Static assets
│   ├── aec/                    # Brand logos (horizontal, vertical, white, square)
│   └── programs/               # Course category badges & imagery
└── src/
    ├── app/
    │   ├── (admin)/            # Admin Management Portal (/management)
    │   ├── (elearning)/        # E-Learning LMS Portal (/elearning)
    │   ├── (landing)/          # Public Website & Marketing (/ & /#)
    │   ├── (public)/           # Public course details, blog, contact
    │   ├── login/              # Unified Auth entry point (/login)
    │   └── api/                # Route handlers (auth, upload, demo-role, teacher-agent)
    ├── components/             # Reusable UI primitives & icons
    └── lib/                    # Core utilities, session management, Prisma client, layouts
```

## Working Rules & Engineering Standards

1. **Small, Local Edits:** Prefer minimal, targeted adjustments over large rewrites.
2. **Data Access & Mutations:**
   - Use Prisma 7 with the `@prisma/adapter-pg` driver adapter.
   - In Server Components and Layouts, ensure queries gracefully fallback to mock/default data if the remote database is temporarily unreachable during local development.
   - Use Next.js Server Actions for secure form mutations.
3. **Authentication & Session:**
   - Handled via `src/lib/session.ts` and NextAuth (`src/lib/authOptions.ts`).
   - Supports role-based access: `ADMIN`, `TEACHER`, `STUDENT`.
   - Local development incorporates a non-intrusive demo role switcher via the `demo_role` cookie or default role mapping without requiring live DB accounts. This is gated by `isDemoMode` in `src/lib/session.ts` and is always off in production; never add auth paths that bypass it. Every server action and API route that mutates data must call `requireAdmin`/`requireUser` itself, since layouts do not protect actions.
4. **Vercel & Infrastructure Optimization:**
   - Regularly run `npm run doctor:vercel` (or `npx vercel-doctor .`) to audit compute duration, link prefetching, large static assets, and caching.
   - Target maintaining a 90+ Vercel Doctor score.
   - Attach database connection pools via `@vercel/functions` `attachDatabasePool` to properly drain idle connections during serverless lifecycles.
5. **UI/UX Consistency:**
   - Management and E-Learning pages must follow the **"Information Density with Professional Clarity"** principle.
   - Retain exact AEC brand colors, typography (`Montserrat`), and spacing hierarchy.

## Important Paths

- **Public Landing Page:** `src/app/(landing)/page.tsx` & `src/app/(landing)/LandingClient.tsx`
- **E-Learning Hub:** `src/app/(elearning)/elearning/`
  - Teacher Workspace: `src/app/(elearning)/elearning/teacher-workspace/`
  - Student Workspace: `src/app/(elearning)/elearning/student-workspace/`
  - AI Teacher Agent: `src/app/(elearning)/elearning/TeacherAiAgent.tsx`
- **Admin Management:** `src/app/(admin)/management/`
  - Classrooms: `src/app/(admin)/management/classrooms/`
  - Accounts: `src/app/(admin)/management/accounts/`
  - Courses & Programs: `src/app/(admin)/management/programs/`
  - Media Library: `src/app/(admin)/management/media/`
  - Posts & News: `src/app/(admin)/management/posts/`
- **Database Client:** `src/lib/prisma.ts`
- **Session / Auth Helper:** `src/lib/session.ts`
- **Shared Layouts:** `src/lib/layout/Navbar.tsx` & `src/lib/layout/Footer.tsx`
- **Skills Lockfile:** `skills-lock.json`

## Environment & Configuration

- Required variables in `.env`:
  - `NEON_DATABASE_URL` (or `DATABASE_URL`): Neon PostgreSQL connection string with SSL mode.
  - `NEXTAUTH_SECRET`: Secret key for session encryption.
  - `NEXTAUTH_URL`: Canonical application URL (`http://localhost:3000` in dev).
  - Optional Cloudinary / Media storage keys: `CLOUDINARY_URL`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`.

---

# AEC Full Design System

This section governs visual identity across public marketing pages, LMS student/teacher dashboards, and administrative interfaces.

## 1. Brand Overview & Positioning

- **Brand:** Academy English Center (AEC)
- **Website:** academy.edu.vn
- **Tone & Personality:** Professional, educational, trusted, modern, energetic, optimistic, student-centered, international-standard.
- **Visual Feel:** Bright, clean, trustworthy, modern, energetic, achievement-focused.
- **Avoid:** Childish visuals, cold corporate looks, dark-first UIs, overuse of heavy gradients, random icon styles, muddy shadows, low-contrast text.

## 2. Color System & Design Tokens

We use native CSS variables alongside Tailwind CSS utility classes.

**Brand Palette:**
- **Primary Orange (`#f68d2e`)**: CTAs, active highlights, icons, notification badges, key metrics.
- **Orange Hover (`#ea740a`)**: Interactive hover and active focus states.
- **Light Orange Bg (`#fef4eb`)**: Soft highlight section backgrounds and alert banners.
- **Primary Navy (`#2c2d65`)**: Headings, navigation text, primary buttons, deep structural accents.
- **Dark Navy (`#1d1e44`)**: High-contrast dark backgrounds and secondary text.
- **Deep Navy (`#0e0f22`)**: Darkest contrast accents and footer headers.
- **Light Navy Bg (`#f0f0f8`)**: Dashboard surface cards, table headers, soft section fills.
- **Text Main (`#2c2d65`)** / **Text Muted (`#5f607a`)**
- **White (`#ffffff`)**: Cards, clean canvas backgrounds, and elevated surfaces.

**Gradients:** Use only for subtle decoration (e.g. hero accent, status banner, active pills). Never apply gradients across logos.
- Example: `linear-gradient(90deg, #f68d2e 0%, #2c2d65 100%)`

## 3. Typography

- **Primary Font:** `Montserrat` (`--font-montserrat`) across all interfaces.
- **Headings:** Bold Navy with Orange emphasis for focal keywords only.
- **Scale:**
  - `text-xs` (0.75rem): Metadata, badges, table captions.
  - `text-sm` (0.875rem): Standard UI buttons, inputs, table body cells.
  - `text-base` (1rem): Body paragraphs, card titles.
  - `text-lg` to `text-2xl`: Section headings and card KPI counters.
  - `text-3xl` to `text-5xl`: Hero statements and primary page banners.

## 4. Logo Usage Rules

- **Header Placement:** Horizontal logo (`/aec/aec-logo-horizontal.png`).
- **Footer Placement:** Vertical or square logo (`/aec/aec-logo-vertical.png` or `/aec/aec-logo-square.png`).
- **Dark Sections:** Inverted / white logo variant (`/aec/aec-logo-white.png`).
- **Safety:** Maintain clear space (at least 0.5x logo height) without distortion or color altering.

## 5. UI Components & Dashboard Patterns

### Elearning & Admin Dashboard Patterns
- **Compact Hero Overviews:** Header sections pairing the page title with real-time summary pills and quick actions.
- **Responsive Data Grids:** 4 columns desktop (`lg:grid-cols-4`), 2 tablet (`md:grid-cols-2`), 1 mobile (`grid-cols-1`).
- **Cards & Surfaces:** Rounded corners (`12px` to `16px`), subtle border (`border-slate-200`), diffuse soft shadow (`shadow-sm`).
- **Status Indicators:** Pill badges with distinct semantic colors:
  - Active / Completed: Emerald (`bg-emerald-50 text-emerald-700`)
  - Pending / Warning: Amber (`bg-amber-50 text-amber-700`)
  - Info / Scheduled: Blue (`bg-blue-50 text-blue-700`)
- **Empty States:** Centered dashed-border containers with a muted icon and an immediate action CTA.

---

# Agent Skills Integration

The project uses the agent skill ecosystem managed via `skills-lock.json` and the `skills` CLI:

- **`vercel-doctor`:** Scans for Next.js and Vercel bill-inflating patterns, memory usage, dynamic route overuse, and unoptimized assets.
- **`frontend-ui-engineering`:** Ensures accessible, robust, and clean React UI patterns.
- **`hallmark`:** Anti-AI-slop design system guidelines and bespoke styling recipes.
- **`neon` & `neon-postgres`:** Serverless database management, connection pooling, and branching patterns.

To verify or update agent skills:
```bash
npx skills list
npm run doctor:vercel
```