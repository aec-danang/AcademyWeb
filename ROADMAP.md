# AEC Database Optimization Roadmap

This roadmap defines 4 tasks to optimize performance, ensure consistency, and improve schema type safety for the AEC Elearning platform. Each task serves as a concise prompt for an AI agent.

---

## Task Fix 1: Database Transactions

### 🤖 AI Agent Prompt
```markdown
Objective: Wrap multi-write Server Actions in atomic database transactions (`prisma.$transaction`).

Target Files:
- [teacherActions.ts](file:///d:/Projects/Mixed/AcademyWeb/src/lib/teacherActions.ts)
- [lmsActions.ts](file:///d:/Projects/Mixed/AcademyWeb/src/lib/lmsActions.ts)

Instructions:
1. In `createClassSectionAction` (teacherActions.ts), wrap the `Course` and `ClassSection` creation in a transaction.
2. In `addQuizQuestionAction` and `createPracticeQuestionAction` (lmsActions.ts), wrap `Question` creation and `QuizQuestion` linking in a transaction.
3. In `importPracticeTestJsonAction` (lmsActions.ts), wrap the section/question import loops in a transaction.
4. In `gradeSubmissionAction` (lmsActions.ts), wrap the `Grade` upsert and `Submission` update in a transaction.
```

---

## Task Fix 2: Batching & Write Optimization

### 🤖 AI Agent Prompt
```markdown
Objective: Optimize quiz submission loops in `src/lib/lmsActions.ts` using batch queries (`createMany`).

Target Files:
- [lmsActions.ts](file:///d:/Projects/Mixed/AcademyWeb/src/lib/lmsActions.ts)

Instructions:
1. In `submitPracticeTestAttemptAction`, collect answers inside the loop and perform a single `prisma.attemptAnswer.createMany` call at the end.
2. In `submitQuizAttemptAction`, batch insert all answers using `prisma.attemptAnswer.createMany` rather than executing single queries in the loop.
3. Verify that grade calculation and status updates are executed correctly after the bulk insert.
```

---

## Task Fix 3: Indexing & Constraints

### 🤖 AI Agent Prompt
```markdown
Objective: Add missing relational indexes and constraints to `prisma/schema.prisma`.

Target Files:
- [schema.prisma](file:///d:/Projects/Mixed/AcademyWeb/prisma/schema.prisma)

Instructions:
1. Add `@@index` annotations to the following models' foreign key fields:
   - `Lesson`: `courseId`
   - `ClassSection`: `courseId`, `teacherId`
   - `Enrollment`: `classSectionId`
   - `Assignment`: `classSectionId`, `createdById`
   - `Attempt`: `quizId`, `studentId`
   - `Grade`: `studentId`, `assignmentId`, `quizId`, `attemptId`, `submissionId`
   - `ActivityLog`: `actorId`
2. Add a `@unique` constraint to `Grade.attemptId` to prevent duplicate grades for a single quiz attempt.
3. Add `createdAt DateTime @default(now())` and `updatedAt DateTime @updatedAt` to `SiteSetting` and `MenuItem` models.
```

---

## Task Fix 4: Types & Schema Standardization

### 🤖 AI Agent Prompt
```markdown
Objective: Standardize field types, primary keys, and statuses in `prisma/schema.prisma`.

Target Files:
- [schema.prisma](file:///d:/Projects/Mixed/AcademyWeb/prisma/schema.prisma)
- [lmsActions.ts](file:///d:/Projects/Mixed/AcademyWeb/src/lib/lmsActions.ts)

Instructions:
1. Change `Course.price` and `Order.totalAmount` from `Float` to `Decimal` (using `@db.Decimal(10, 2)`).
2. Convert string statuses to Database Enums:
   - `Lead.status` -> `LeadStatus` enum (`NEW`, `CONTACTED`, `QUALIFIED`, `CLOSED`)
   - `Order.status` -> `OrderStatus` enum (`PENDING`, `COMPLETED`, `FAILED`, `REFUNDED`)
   - `MenuItem.position` -> `MenuPosition` enum (`HEADER`, `FOOTER`)
3. Refactor `Post` primary key from `slug String @id` to `id String @id @default(cuid())` and add `slug String @unique`.
4. Update referencing queries and types in the codebase to align with these type changes.
```
