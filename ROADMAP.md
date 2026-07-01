# AEC / Academy English Center - AI Agent Development Roadmap

This roadmap focuses strictly on bridging the admin management system (`(admin)`) and the public information pages (`(public)`). 
**Note:** E-learning features are completely excluded from this scope. The public pages must strictly adhere to the existing AEC design system, while the admin pages will continue using and enhancing the current shadcn/ui framework.

Each phase is formatted as an **AI Agent Prompt** so that it can be directly copied and pasted to an AI assistant for execution.

---

## Phase 1: Admin Content & Posts Enhancement
**Agent Prompt:**
> "Your task is to upgrade the post management system in `src/app/(admin)/management/posts`. 
> 1. Integrate a Rich Text Editor (like TipTap or a similar lightweight alternative) for the post content field.
> 2. Implement an image upload mechanism for the `featuredImage` field.
> 3. Enhance the `PostsClient.tsx` data table with better filtering options.
> 4. Ensure all UI modifications strictly use the existing shadcn/ui component system. The admin design should feel modern and premium but remain strictly within the shadcn ecosystem. Do not touch any `(elearning)` code."

## Phase 2: Admin Account Management Polish
**Agent Prompt:**
> "Your task is to improve the account management UI in `src/app/(admin)/management/accounts/AccountManagerClient.tsx`.
> 1. Add advanced sorting and pagination to the existing data table.
> 2. Replace current inline error messages with modern toast notifications for all success/error states.
> 3. Enhance the visual distinction between roles (Student, Teacher, Admin) using improved badges or icons.
> 4. Ensure clear container boxes, sleek inputs, and good spacing, strictly retaining the shadcn design framework. Do not touch any `(elearning)` code."

## Phase 3: Public Pages - News & Blog Dynamic Integration
**Agent Prompt:**
> "Your task is to integrate the Prisma `Post` database model with the public-facing pages in `src/app/(public)/news` and `src/app/(public)/blog`.
> 1. Replace the static 'coming soon' placeholders with a dynamic feed of posts (filtered by type: 'news' or 'post').
> 2. Implement a fully functional blog listing page and individual post pages (`[slug]`).
> 3. **CRITICAL:** You must strictly use the existing AEC design system, fonts, and colors. Do not invent new styles or layouts; adapt the dynamic data to fit flawlessly into the current public page design patterns. Do not touch any `(elearning)` code."
------------------
## Phase 4: Public Pages - About & Additional Content
**Agent Prompt:**
> "Your task is to connect the remaining public pages (like `/about`, `/programs`, etc. in `src/app/(public)`) to their respective Prisma models (e.g., `Sponsor`, `Testimonial`, `Faq`).
> 1. Fetch and display sponsors, testimonials, and FAQs dynamically from the database instead of hardcoding them.
> 2. Ensure responsive layouts for all integrated data.
> 3. **CRITICAL:** Preserve all existing component patterns. Keep the public pages in the exact same style and design system. Do not use generic colors or deviate from the established AEC brand. Do not touch any `(elearning)` code."

## Phase 5: SEO Automation & Admin Dashboard
**Agent Prompt:**
> "Your task is to finalize the connection between admin and public pages with SEO and analytics.
> 1. Update the public dynamic pages (`[slug]`, etc.) to automatically populate Next.js Metadata tags using the `metaTitle` and `metaDescription` fields from the `Post` model.
> 2. Create a simple, visually appealing admin dashboard summary (in `src/app/(admin)/management`) that displays key metrics (total published posts, recent accounts).
> 3. Ensure the admin dashboard uses shadcn/ui components (Cards, simple charts if necessary) to maintain a cohesive admin experience. Do not touch any `(elearning)` code."
