# AEC Database Optimization & Refactoring Roadmap

This roadmap contains 4 distinct task fixes designed to optimize performance, guarantee data consistency, and improve schema type safety for the Academy English Center (AEC) Elearning platform. Each task is structured as a self-contained prompt for an AI coding agent.

---

## 📋 Task Fixes Overview
*   **[Task Fix 1: Database Transactions for Multi-Step Operations](#task-fix-1-database-transactions-for-multi-step-operations)**
*   **[Task Fix 2: Batching & Performance Optimizations (N+1 Writes)](#task-fix-2-batching--performance-optimizations-n1-writes)**
*   **[Task Fix 3: Indexing & Relational Constraints](#task-fix-3-indexing--relational-constraints)**
*   **[Task Fix 4: Data Types, Enums & Keys Standardization](#task-fix-4-data-types-enums--keys-standardization)**

---

## Task Fix 1: Database Transactions for Multi-Step Operations

### 🤖 AI Agent Prompt

```markdown
Role: Senior Backend Engineer & Prisma Expert

Context:
In the AEC Elearning codebase, several Server Actions perform multiple independent database writes sequentially without transactional isolation. If a step fails mid-execution, orphaned or partial records remain.

Objective:
Refactor multi-write Server Actions in `src/lib/teacherActions.ts` and `src/lib/lmsActions.ts` to execute inside atomic database transactions (`prisma.$transaction`).

Target Files:
- src/lib/teacherActions.ts
- src/lib/lmsActions.ts

Specific Instructions:
1. Wrap the Course and ClassSection creation in `createClassSectionAction` (teacherActions.ts) in a transaction:
   - Ensure the new Course and ClassSection are both created or both fail together (e.g. if the class code is duplicate).
2. Wrap the Question creation and QuizQuestion junction creation in `addQuizQuestionAction` and `createPracticeQuestionAction` (lmsActions.ts) in a transaction.
3. Wrap the json import loops in `importPracticeTestJsonAction` (lmsActions.ts) in a transaction so that if any part of the test or questions fails to import, the entire import is rolled back.
4. Wrap the Grade upsert and Submission status update in `gradeSubmissionAction` (lmsActions.ts) in a transaction.
5. Preserve all existing error handling, logging, caching (e.g. revalidatePath), and redirect behaviors.

Verification:
- Run a typecheck (`npm run build` or `npx tsc --noEmit`) to verify that all refactored transaction calls compile successfully.
- Verify that when a transaction rolls back (e.g., trying to create a class section with a duplicate code), no orphaned Course is left in the database.
```

---

## Task Fix 2: Batching & Performance Optimizations (N+1 Writes)

### 🤖 AI Agent Prompt

```markdown
Role: Database Performance & Prisma Specialist

Context:
Saving student answers during quiz submissions currently iterates over the questions and writes them one by one to the database. For a 40-100 question exam, this results in high latency, connection pool pressure, and potential gateway timeouts.

Objective:
Refactor quiz submission loop logic in `src/lib/lmsActions.ts` to perform batch writes using `prisma.attemptAnswer.createMany` or transaction batching.

Target Files:
- src/lib/lmsActions.ts

Specific Instructions:
1. In `submitPracticeTestAttemptAction`:
   - Replace the loop query `await prisma.attemptAnswer.upsert(...)` with an in-memory accumulation of answers.
   - Perform a single batch write using `prisma.attemptAnswer.createMany(...)` after the loop.
2. In `submitQuizAttemptAction`:
   - Replace the loop query `await prisma.attemptAnswer.create(...)` with an in-memory accumulation of answers.
   - Batch insert all answers using `prisma.attemptAnswer.createMany(...)`.
3. Handle potential duplicate keys or conflicts by cleaning up or ensuring that `attemptId` and `questionId` are properly handled.
4. Ensure all calculations for grades, scoring, and status updates remain correct and execute after the bulk insert.

Verification:
- Ensure the TypeScript compiler passes and type safety is maintained.
- Run tests or check database records after taking a quiz to confirm that `AttemptAnswer` records are successfully created in bulk and the overall attempt score/grade is calculated correctly.
```

---

## Task Fix 3: Indexing & Relational Constraints

### 🤖 AI Agent Prompt

```markdown
Role: Database Architect & PostgreSQL Expert

Context:
PostgreSQL does not automatically index foreign key columns. The current database lacks indexes on key relations, which will lead to slow Sequential Scans as the user base grows. Additionally, the `Grade` model allows duplicate grades per quiz attempt.

Objective:
Optimize query performance by adding indexes to foreign keys in `prisma/schema.prisma` and enforce a unique constraint on quiz attempt grades.

Target Files:
- prisma/schema.prisma

Specific Instructions:
1. Add `@@index` annotations to all models for columns referencing foreign keys that are frequently queried:
   - `Lesson`: `courseId`
   - `ClassSection`: `courseId`, `teacherId`
   - `Enrollment`: `classSectionId`
   - `Assignment`: `classSectionId`, `createdById`
   - `Attempt`: `quizId`, `studentId`
   - `Grade`: `studentId`, `assignmentId`, `quizId`, `attemptId`, `submissionId`
   - `ActivityLog`: `actorId`
2. Update the `Grade` model so that `attemptId` is unique (`attemptId String? @unique`), preventing duplicate grades for the same attempt.
3. Add missing audit fields (`createdAt DateTime @default(now())` and `updatedAt DateTime @updatedAt`) to the metadata models:
   - `SiteSetting` (needs `createdAt`)
   - `MenuItem` (needs both `createdAt` and `updatedAt`)
4. Regenerate the Prisma client and prepare database migrations.

Verification:
- Run `npx prisma format` to ensure the schema is formatted correctly.
- Run `npx prisma validate` to confirm the relations and schema are valid.
- Generate a migration locally (`npx prisma migrate dev --create-only`) to confirm the SQL output generates the appropriate indexes and constraints.
```

---

## Task Fix 4: Data Types, Enums & Keys Standardization

### 🤖 AI Agent Prompt

```markdown
Role: Senior Full-Stack Engineer

Context:
The schema currently uses float data types for monetary/financial information, uses plain strings for state variables, and uses a mutable text slug as the primary key for the `Post` model.

Objective:
Standardize field types, primary keys, and status fields across `prisma/schema.prisma` for consistency and financial correctness.

Target Files:
- prisma/schema.prisma
- src/lib/lmsActions.ts
- (and any pages/actions interacting with updated enums or keys)

Specific Instructions:
1. Refactor Financial Fields:
   - Convert `Course.price` and `Order.totalAmount` from `Float` to `Decimal` (maps to PostgreSQL `decimal` or `numeric`) to preserve mathematical accuracy:
     ```prisma
     price Decimal @default(0.00) @db.Decimal(10, 2)
     ```
2. Refactor String Fields to Database Enums:
   - Introduce `LeadStatus` enum (`NEW`, `CONTACTED`, `QUALIFIED`, `CLOSED`) and update `Lead.status`.
   - Introduce `OrderStatus` enum (`PENDING`, `COMPLETED`, `FAILED`, `REFUNDED`) and update `Order.status`.
   - Introduce `MenuPosition` enum (`HEADER`, `FOOTER`) and update `MenuItem.position`.
3. Refactor Post Primary Key:
   - In the `Post` model, change `slug String @id` to `id String @id @default(cuid())`.
   - Add `slug String @unique` as a secondary unique field.
4. Update references in code (server actions, queries, types) to match these schema updates.

Verification:
- Verify that `npx prisma validate` succeeds.
- Run typecheck (`npm run build` or `npx tsc --noEmit`) to verify that all code compiles after migrating from floats to Decimals and strings to enums.
```
