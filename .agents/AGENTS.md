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

# AEC Full Design System

This section contains both the public website guidelines and the internal elearning dashboard (teacher/student) philosophy.

## 1. Brand Overview & Positioning

- **Brand:** Academy English Center (AEC)
- **Website:** academy.edu.vn
- **Tone & Personality:** Professional, educational, trusted, modern, energetic, optimistic, student-centered, community-focused, international-standard, humanistic.
- **Visual Feel:** Bright, clean, trustworthy, modern, energetic, achievement-focused. 
- **Avoid:** Childish visuals, cold corporate looks, dark-first UIs, overuse of gradients, random icon styles, heavy shadows, low-contrast text.

## 2. Color System & Tokens

We use native CSS variables alongside Tailwind CSS utility classes. 
Shadcn integrations map our brand colors to `--primary` and `--foreground`.

**Color Palette:**
- **Primary Orange (`#f68d2e`)**: For Call-To-Action (CTA) elements, active states, icons, badges, and highlights.
- **Orange Hover (`#ea740a`)**: Interactive state for primary elements.
- **Light Orange Bg (`#fef4eb`)**: Soft section backgrounds.
- **Primary Navy (`#2c2d65`)**: For primary text, headings, footer, navigation text, and deep background accents.
- **Dark Navy (`#1d1e44`)**: Deeper accents.
- **Deep Navy (`#0e0f22`)**: Darkest accents.
- **Light Navy Bg (`#f0f0f8`)**: Soft section backgrounds.
- **Text Main (`#2c2d65`)** / **Text Muted (`#5f607a`)**
- **White (`#ffffff`)**: Cards and main layout areas.

**Gradients:** Use only as decoration (e.g., hero overlay, CTA banner, card hover accent). Never apply gradients to the logo. 
Example: `background: linear-gradient(90deg, #f68d2e 0%, #2c2d65 100%);`

## 3. Typography

- **Primary Font:** `Montserrat` is used for all text (headings and body) to maintain a clean, geometric, and modern look.
- **Scale:** We utilize a strict typographic scale from text-xs (0.75rem) to text-5xl (3.5rem).
- **Headings:** Bold Navy, with Orange emphasis for key words only. Uppercase is allowed only for short, impact headings.
- **Buttons:** Bold, high-contrast, highly legible.

## 4. Logo Usage Rules

- **Allowed versions:** Full-color on white/light, Inverted on dark navy, Monochrome for special print, Vertical, or Horizontal layouts.
- **Website placement:** 
  - Header: Horizontal logo.
  - Footer/Intro sections: Vertical logo.
  - Dark sections: Inverted logo only.
- **Don'ts:** Do not stretch, alter ratio, recolor outside approved palettes, turn into outline, add shadow/gradient, place on low contrast, change font/spacing, or redrawn the logo. Reserve clear space (0.5x height).

## 5. Shape, Layout & Structure

- **Container:** Centered with a max width around `1200px`. Generous whitespace (e.g. `80px` section padding).
- **Border Radius:** Heavily utilized rounded corners (`8px` to `24px` / pill `999px`) to make dense data feel friendly and modern.
- **Shadows:** Soft, diffused shadows for cards (`0 16px 40px rgba(44, 45, 101, 0.08)`) and buttons (`0 8px 20px rgba(246, 141, 46, 0.28)`) elevate panels without visual clutter.
- **Graphic Elements:** Use the abstract AEC logo symbol (human/book/bird-wing) as recurring shapes. Use official palette recolors only, with subtle opacity (4% - 12%) for backgrounds, watermarks, and patterns.

## 6. Components & UI Patterns

- **Primary CTA:** Orange pill button (`#f68d2e`), bold white text, hover (`#ea740a`).
- **Secondary CTA:** White or Navy outline button (`#2c2d65` border), bold text.
- **Dark CTA:** Navy button (`#2c2d65`), bold white text.
- **Cards:** White background, rounded corners (e.g., 24px), soft shadow, optional orange top border. Navy titles, orange icons.

### Elearning Dashboard Patterns

The dashboard focuses on **"Information Density with Professional Clarity,"** prioritizing efficiency over decoration.

1. **Reused Shadcn Components:** `Button`, `Badge` (status), `Select`/`Input` (filtering), `DropdownMenu` (quick actions), `Skeleton` (loading).
2. **Compact Hero Overviews:** Dashboard hero sections incorporate inline statistics next to the page title.
3. **Responsive Data Grids:** Fluid CSS grids (4 columns desktop, 2 tablet, 1 mobile). Cards are self-contained and act as large click targets.
4. **Consolidated Toolbars:** Filtering, sorting, and searching are grouped in a single responsive toolbar above the data grid.
5. **Action-Oriented Cards:** Cards display a status badge, concise metadata in the footer, and a secondary quick-action menu (three dots) to bypass deeper navigation.
6. **Inline Empty States:** Centered, dashed-border container with a muted icon and a clear CTA when lists are empty.

## 7. Homepage Structure (Public Site)

1. **Header:** Logo, Navigation links, Register Now button.
2. **Hero:** Headline ("Learn English..."), subtext, CTAs (Find Course, Book Test), visual (student photo, logo shape).
3. **Program Categories:** Clean layout of all offerings.
4. **Why Choose AEC / Vision / Mission:** Highlighting core values.
5. **Teachers / Student Success:** Showcasing the academic team and testimonials.
6. **Footer:** Navy footer, orange icons, quick links.