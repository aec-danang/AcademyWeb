# Academy English Center - Web Application

This is a [Next.js](https://nextjs.org) project bootstrapped with `create-next-app`.

## Tech Stack
- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Database:** Neon (Serverless PostgreSQL)
- **ORM:** Prisma
- **Authentication:** NextAuth.js
- **Storage:** Cloudflare R2
- **Hosting:** Vercel
- **Version Control:** GitHub

## Getting Started

First, make sure you have the required environment variables set up. Copy `.env.example` to `.env` and fill in the necessary values, especially `NEON_DATABASE_URL`.

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load the Montserrat font family, as dictated by the design system.

## Design System & Agents

For AI agents and developers working on this project, the comprehensive design system, UI/UX philosophy, and working rules have been consolidated into `.agents/AGENTS.md`.

## Features
- **Public Website:** Landing pages, course information, and marketing materials for Academy English Center.
- **Elearning Dashboard:** Teacher and Student portals for managing courses, tracking progress, and delivering online learning experiences.
