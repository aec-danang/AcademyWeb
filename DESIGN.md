---
colors:
  primary: "#f68d2e"
  primary_hover: "#ea740a"
  primary_light: "#fef4eb"
  navy: "#2c2d65"
  navy_dark: "#1d1e44"
  navy_deep: "#0e0f22"
  navy_light: "#f0f0f8"
  text_main: "#2c2d65"
  text_muted: "#5f607a"

typography:
  font_family: "var(--font-montserrat), sans-serif"
  scale:
    xs: "0.75rem"
    sm: "0.875rem"
    base: "1rem"
    lg: "1.125rem"
    xl: "1.25rem"
    2xl: "1.5rem"
    3xl: "2rem"

spacing:
  container: "1200px"
  section_padding: "80px"

border_radius:
  sm: "8px"
  md: "16px"
  lg: "24px"
  pill: "999px"

shadows:
  card: "0 16px 40px rgba(44, 45, 101, 0.08)"
  button: "0 8px 20px rgba(246, 141, 46, 0.28)"
---

# AEC Elearning Design Philosophy

This document outlines the UI/UX design philosophy, tokens, and patterns used throughout the AEC Elearning platform (Teacher & Student Dashboards). It serves as a guide to maintain consistency, usability, and visual identity.

## Design Philosophy

The core philosophy of the elearning dashboard revolves around **"Information Density with Professional Clarity."** 
It is inspired by modern Learning Management Systems (LMS) and productivity tools (like Notion, Linear, and Canvas). 

- **Efficiency Over Decoration:** Teachers and students visit the dashboard to get things done. We prioritize compact hero sections, dense but readable data grids, and accessible quick actions.
- **Visual Hierarchy:** Critical data (Course Titles, Statuses, Metrics) is emphasized using weight and color, while descriptions are clamped and muted.
- **Unified Branding:** The interface balances the playful and energetic AEC Orange (`#f68d2e`) against the authoritative and professional AEC Navy (`#2c2d65`).

## Tokens & Variables

We rely on native CSS variables (defined in `globals.css`) alongside Tailwind CSS utility classes to enforce our design tokens.

### Colors
We reuse a strictly defined palette:
- **Navy (`#2c2d65`)** is used for primary text, headings, and deep background accents.
- **Orange (`#f68d2e`)** is reserved for primary Call-To-Action (CTA) elements, active states, and highlights.
- **Shadcn Integrations:** We map our brand colors to Shadcn's root variables (`--primary`, `--foreground`) to ensure third-party components blend seamlessly into the AEC brand.

### Typography
- **Primary Font:** `Montserrat` is used for both headings and body text to maintain a clean, geometric, and modern look.
- We utilize a strict typographic scale from `--text-xs` up to `--text-5xl` to ensure rhythmic vertical spacing.

### Shape & Structure
- **Border Radius:** We heavily utilize rounded corners (`--radius-md: 16px`, `--radius-lg: 24px`) to make the dense data feel friendly and modern.
- **Shadows:** Soft, diffused shadows (`--shadow-card`) elevate panels and cards without causing visual clutter.

## Components & Patterns

### Reused Components
We leverage **Shadcn UI** for base accessibility and styling, heavily reusing:
- `Button`: For all standard interactions.
- `Badge`: For status indicators (e.g., Published, Draft).
- `Select` & `Input`: For unified filtering and search toolbars.
- `DropdownMenu`: For quick-action menus inside grid items.
- `Skeleton`: For layout-preserving loading states.

### Repeated UI Patterns

1. **Compact Hero Overviews (`cockpitHero` / Dashboard Hero)**
   Instead of empty banners, our hero sections incorporate inline statistics (e.g., Total Students, Published Courses) directly next to the page title. This pattern provides immediate value above the fold.

2. **Responsive Data Grids (`courseGrid`)**
   Content is organized into fluid CSS grids (typically 4 columns on desktop, 2 on tablet, 1 on mobile). Items within the grid are self-contained cards that act as large click targets.

3. **Consolidated Toolbars**
   Filtering (Status), Sorting, and Searching are always grouped into a single, responsive toolbar placed immediately above the data grid.

4. **Action-Oriented Cards (`courseCard`)**
   Every card displays a status badge at the top, concise metadata (student count, lesson count, last updated) in a subtle footer, and provides a secondary quick-action menu (three dots) to bypass deeper navigation.

5. **Inline Empty States**
   When lists are empty or filters return zero results, we display a centered, dashed-border container with a muted icon and a clear CTA (e.g., "Create your first course").
