# Academy English Center (AEC) — Web Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.4.2-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-blue?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7.10-2D3748?style=flat&logo=prisma)](https://www.prisma.io/)
[![Neon](https://img.shields.io/badge/Neon-Serverless_Postgres-00E599?style=flat&logo=postgresql)](https://neon.tech/)
[![Vercel Doctor](https://img.shields.io/badge/Vercel_Doctor-93%2F100-success?style=flat&logo=vercel)](https://vercel-doctor.com)

The official web platform and learning management system (LMS) for **Academy English Center (AEC)** ([academy.edu.vn](https://academy.edu.vn)), serving learners, educators, and administrators across Da Nang and nationwide.

---


## 🌟 Key Modules

### 🌐 1. Public Marketing Portal
- **Hero & Storytelling:** Highlighting AEC's 25-year milestone, educational mission, and key metrics.
- **Academic Programs:** Detailed views for IELTS preparation, Young Learners (Kids), Teenagers (Teens), Communication, and Corporate Training.
- **Interactive Inquiries:** Placement test booking, trial class scheduling, and branch inquiries.
- **Dynamic Content:** Blog, announcements, student life gallery, and student testimonials.

### 🎓 2. E-Learning LMS (`/elearning`)
- **Teacher Workspace:** Live metrics on ungraded homework, pending attendance, priority tasks, and scheduled classes.
- **Student Workspace:** Self-service learning area with assignments, practice quizzes, and feedback tracking.
- **AI Teacher Agent:** Integrated assistant to accelerate lesson preparation, grading rubrics, and automated exercise formulation.
- **Demo Role Switcher:** Instant local role toggling between `ADMIN`, `TEACHER`, and `STUDENT` without requiring live account authentication.

### ⚙️ 3. Administrative Management Suite (`/management`)
- **Academic Operations:** Classroom scheduling, course curricula, syllabus updates, and student enrollment approvals.
- **Account Governance:** User account management, instructor assignments, and permission levels.
- **Media & Content:** Asset library, blog publications, event schedules, and testimonial approvals.

---

## 🛠 Tech Stack

| Domain | Technology |
| --- | --- |
| **Framework** | [Next.js 16](https://nextjs.org) (App Router, Turbopack, React 19) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org) |
| **Styling & Motion** | [Tailwind CSS v4](https://tailwindcss.com), [GSAP](https://greensock.com/gsap/), [Radix UI](https://www.radix-ui.com), [Lucide Icons](https://lucide.dev) |
| **Database & ORM** | [Neon](https://neon.tech) (Serverless PostgreSQL) + [Prisma 7](https://www.prisma.io) (`@prisma/adapter-pg`) |
| **Authentication** | [NextAuth.js](https://next-auth.js.org) (Credentials & Role-Based RBAC) |
| **Optimization** | [Vercel Doctor](https://vercel-doctor.com) + `@vercel/functions` pool attachment |
| **Agent Ecosystem** | `npx skills` ([skills.sh](https://skills.sh)) with Vercel Doctor, Hallmark, and Neon skills |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ (or LTS)
- pnpm (recommended) or npm / yarn

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/JoshiMinh/AcademyWeb.git
cd AcademyWeb
pnpm install
```

### 2. Environment Configuration
Copy [`.env.example`](.env.example) to `.env` and fill in the values. It lists every variable the app reads; only the database, NextAuth and Cloudinary groups are required.

### 3. Database Migration
```bash
pnpm prisma generate
pnpm prisma migrate deploy
```
`prisma/migrations/0_init` is a baseline of the current schema. On an existing database, mark it applied once with `pnpm prisma migrate resolve --applied 0_init` (see [MAINTENANCE.md](MAINTENANCE.md)).

### 4. Start Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📋 Available Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Starts the Next.js development server with Turbopack |
| `pnpm build` | Compiles and builds the production bundle |
| `pnpm start` | Runs the built production server |
| `pnpm lint` | Runs ESLint analysis across the repository |
| `pnpm typecheck` | Type-checks the project without emitting |
| `pnpm build:check` | Compile-only build (no database needed); used by CI |
| `pnpm smoke` | Checks a deployed site's key routes (`SMOKE_BASE_URL=https://… pnpm smoke`) |
| `pnpm doctor:vercel` | Runs Vercel Doctor diagnostic audit for cost and performance footguns |

---

## 🤖 Agent Skills & Developer Rules

Developer guidelines, AEC design system tokens, and agent instructions are documented in [`.agents/AGENTS.md`](.agents/AGENTS.md).

Installed skills can be inspected or updated via:
```bash
npx skills list
npm run doctor:vercel
```

---

## 📄 License
Proprietary — All rights reserved by **Academy English Center (AEC)**.
