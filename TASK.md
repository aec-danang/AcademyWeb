# Landing Page Implementation Plan

The following tasks are formatted as specific AI Agent prompts so that each phase can be executed autonomously.

## Task 1: Database Schema & Seeding
**Prompt:**
> "Please analyze the `prisma/schema.prisma` file. We need to support new landing page sections: Stats, Features, Events/News, and a Hall of Fame. 
> 1. Create a new `SiteFeature` model (id, title, description, iconValue, order, published) for the 'Key Features' section. 
> 2. Expand the existing `Testimonial` model by adding a `score` field (String, optional), an `isHallOfFame` field (Boolean, default false), and an `isFeatured` field (Boolean, default false) so admins can pin specific testimonials to the front page as the list grows.
> 3. Ensure the `Post` model is used for Events and News via its existing `type` field.
> 4. After modifying the schema, run `npx prisma db push` and `npx prisma generate`. 
> 5. Finally, write and execute a seed script (`seed-landing.ts`) to populate the `SiteSetting` table with statistics (e.g., 44 native teachers), seed the `SiteFeature` table, seed `Post` with sample events/news, and seed `Testimonial` with high-scoring Hall of Fame legacy data."

## Task 2: Admin Dashboard Management UIs
**Prompt:**
> "Please build the admin management interfaces for all the new landing page content under `src/app/(admin)/management/`. 
> 1. Implement full CRUD Server Actions for `SiteFeature`, `Post` (filtering by 'event' and 'news'), `Testimonial` (ensuring the new `score`, `isHallOfFame`, and `isFeatured` fields are manageable), and `SiteSetting` (specifically for managing the Stats Counter values like 44 native teachers, 2900 students, etc.).
> 2. Build the corresponding Client UIs (Data Tables, Forms) for each. 
> 3. Add their navigation links to the Admin sidebar (`app-sidebar.tsx`) and the dashboard Quick Links card (`management/page.tsx`)."

## Task 3: Landing Page UI - Stats & Features
**Prompt:**
> "Please implement the first half of the new landing page sections in `src/app/(landing)/page.tsx` and `src/app/(landing)/LandingClient.tsx`. 
> 1. Fetch the statistics from the `SiteSetting` table and create a visually striking Stats Counter section, utilizing `gsap` for number counting animations when scrolled into view. 
> 2. Fetch the `SiteFeature` data and build the 'Key Features' (Đặc điểm nổi bật) section. This section must match the brand's dark-blue background aesthetic, with left-aligned images/icons and right-aligned text descriptions."

## Task 4: Landing Page UI - Events, News & Hall of Fame Testimonials
**Prompt:**
> "Please implement the remaining landing page sections in `LandingClient.tsx`. 
> 1. Fetch `Post` data where `type='event'` and build an image-heavy Events Carousel. 
> 2. Fetch `Post` data where `type='news'` and build a modern News grid section. 
> 3. Fetch `Testimonial` data and build the combined 'Testimonial / Hall of Fame' section. Display student quotes alongside their high scores (e.g., IELTS 8.0) and avatars using a premium grid or carousel. Ensure the design utilizes the brand's navy blue backgrounds and distinctive yellow quote accents."

## Task 5: Implement a Full Rich Text Editor Engine
**Prompt:**
> "Please implement a robust, full-featured Rich Text Editor component (e.g., using TipTap or an equivalent modern library). Integrate this unified editor across the Admin Dashboard for managing `Program` contents, `Post` content, `SiteFeature` descriptions, and any other entities requiring rich text. The editor must support standard formatting, headings, lists, links, and embedded media."

## Task 6: Visual Icon Selector Component
**Prompt:**
> "Please build an interactive, visual Icon Selector component for the Admin Dashboard. Replace the current manual text-input fields for icons (where users have to type Lucide icon names) with a searchable, visual grid of available icons. Integrate this selector into the management forms for `SiteProgram` and `SiteFeature`."
