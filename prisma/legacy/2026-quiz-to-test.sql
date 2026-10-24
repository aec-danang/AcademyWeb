-- 1. Move Next-Auth tables to public schema
ALTER TABLE "elearning"."Account" SET SCHEMA "public";
ALTER TABLE "elearning"."Session" SET SCHEMA "public";
ALTER TABLE "elearning"."VerificationToken" SET SCHEMA "public";

-- 2. Update Test Model structure
ALTER TABLE "elearning"."Test" ADD COLUMN "lessonId" TEXT;
ALTER TABLE "elearning"."Test" ADD CONSTRAINT "Test_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "elearning"."Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 3. Update TestQuestion Model structure
ALTER TABLE "elearning"."TestQuestion" RENAME COLUMN "question" TO "text";

-- 4. Update Order Model structure
ALTER TABLE "elearning"."Order" ADD COLUMN "courseId" TEXT;
ALTER TABLE "elearning"."Order" ADD CONSTRAINT "Order_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "elearning"."Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 5. Update Testimonial Model structure
ALTER TABLE "public"."Testimonial" ADD COLUMN "userId" TEXT;
ALTER TABLE "public"."Testimonial" ADD CONSTRAINT "Testimonial_userId_fkey" FOREIGN KEY ("userId") REFERENCES "elearning"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 6. Migrate Data: Quiz -> Test
INSERT INTO "elearning"."Test" ("id", "title", "timeLimit", "lessonId", "createdAt", "updatedAt")
SELECT "id", "title", "timeLimit", "lessonId", "createdAt", "updatedAt" FROM "elearning"."Quiz";

-- 7. Migrate Data: Question -> TestQuestion
INSERT INTO "elearning"."TestQuestion" ("id", "testId", "text", "options", "answer")
SELECT "id", "quizId", "text", "options", "answer" FROM "elearning"."Question";

-- 8. Migrate Data: QuizResult -> TestResult
INSERT INTO "elearning"."TestResult" ("id", "testId", "userId", "score", "createdAt")
SELECT "id", "quizId", "userId", "score", "createdAt" FROM "elearning"."QuizResult";

-- 9. Drop Legacy Tables
DROP TABLE "elearning"."QuizResult" CASCADE;
DROP TABLE "elearning"."Question" CASCADE;
DROP TABLE "elearning"."Quiz" CASCADE;
