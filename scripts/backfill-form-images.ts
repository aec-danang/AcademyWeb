/* eslint-disable @typescript-eslint/no-explicit-any */
import * as fs from "fs";
import { google } from "googleapis";
import {
  addLine,
  CREDENTIALS_PATH,
  imageTagFromGoogleImage,
  isSurveyItem,
  TOKEN_PATH,
} from "./form-import-utils";

type QuizWithQuestions = Awaited<ReturnType<typeof loadQuizzes>>[number];

let prismaForDisconnect: { $disconnect: () => Promise<void> } | null = null;

function loadEnvFile() {
  if (!fs.existsSync(".env")) return;
  const envText = fs.readFileSync(".env", "utf8");
  for (const line of envText.split(/\r?\n/)) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*"?([^"\r\n]*)"?\s*$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2];
    }
  }
}

async function getAuth() {
  if (!fs.existsSync(CREDENTIALS_PATH) || !fs.existsSync(TOKEN_PATH)) {
    throw new Error(`Missing Google credentials at ${CREDENTIALS_PATH} or token at ${TOKEN_PATH}`);
  }

  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf8"));
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  oAuth2Client.setCredentials(JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8")));
  return oAuth2Client;
}

async function loadQuizzes(prisma: any, quizId?: string) {
  return prisma.quiz.findMany({
    where: {
      ...(quizId ? { id: quizId } : {}),
      importSource: { not: null },
    },
    orderBy: [{ title: "asc" }, { createdAt: "asc" }],
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: {
          question: {
            include: {
              options: { orderBy: { order: "asc" } },
            },
          },
        },
      },
    },
  });
}

function normalizeText(value: string | null | undefined) {
  return (value || "")
    .toLowerCase()
    .replace(/\[image:[\s\S]*?\]/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function hasImageTag(value: string | null | undefined) {
  return /\[Image:\s*.+?\]/i.test(value || "");
}

function hasGoogleImage(image: any) {
  return Boolean(image?.contentUri);
}

function optionLabelAndText(value: string) {
  const match = value.match(/^([a-zA-Z])[\.)]\s*(.+)$/);
  if (!match) return { label: null, text: value.trim() };
  return { label: match[1].toLowerCase(), text: match[2].trim() };
}

function optionMatches(dbText: string, googleValue: string) {
  const db = normalizeText(dbText);
  const google = normalizeText(googleValue);
  if (!db || !google) return false;
  if (db === google) return true;
  const dbParts = optionLabelAndText(db);
  const googleParts = optionLabelAndText(google);
  return Boolean(dbParts.text && googleParts.text && dbParts.text === googleParts.text);
}

function findLinkForItem(quiz: QuizWithQuestions, formIndex: number, title: string, usedQuestionIds: Set<string>) {
  const byOrder = quiz.questions.find((link: any) => (
    !usedQuestionIds.has(link.questionId) &&
    (link.order === formIndex || link.question.sourceOrder === formIndex)
  ));
  if (byOrder) return byOrder;

  const normalizedTitle = normalizeText(title);
  if (!normalizedTitle) return null;

  return quiz.questions.find((link: any) => {
    if (usedQuestionIds.has(link.questionId)) return false;
    const current = normalizeText(link.question.text).split("[image:")[0].trim();
    return current === normalizedTitle || current.startsWith(`${normalizedTitle} `);
  }) || null;
}

async function appendImageTag(auth: any, text: string, image: any) {
  if (!hasGoogleImage(image) || hasImageTag(text)) return text;
  return addLine(text, await imageTagFromGoogleImage(auth, image));
}

async function updateQuestionImage(prisma: any, auth: any, link: QuizWithQuestions["questions"][number], image: any, apply: boolean) {
  if (!hasGoogleImage(image) || hasImageTag(link.question.text)) return false;
  if (!apply) return true;

  const nextText = await appendImageTag(auth, link.question.text, image);
  await prisma.question.update({
    where: { id: link.questionId },
    data: { text: nextText },
  });
  return true;
}

async function updateOptionImages(prisma: any, auth: any, link: QuizWithQuestions["questions"][number], options: any[], apply: boolean) {
  let updates = 0;
  const usedOptionIds = new Set<string>();

  for (const googleOption of options) {
    if (!hasGoogleImage(googleOption.image)) continue;
    const dbOption = link.question.options.find((option: any) => (
      !usedOptionIds.has(option.id) &&
      optionMatches(option.text, googleOption.value || "")
    ));
    if (!dbOption || hasImageTag(dbOption.text)) continue;

    updates++;
    usedOptionIds.add(dbOption.id);
    if (apply) {
      const nextText = await appendImageTag(auth, dbOption.text, googleOption.image);
      await prisma.questionOption.update({
        where: { id: dbOption.id },
        data: { text: nextText },
      });
    }
  }

  return updates;
}

async function processQuiz(prisma: any, auth: any, forms: any, quiz: QuizWithQuestions, apply: boolean) {
  const formId = quiz.importSource;
  if (!formId) return null;

  let form: any;
  try {
    const res = await forms.forms.get({ formId });
    form = res.data;
  } catch (error: any) {
    return {
      quizId: quiz.id,
      title: quiz.title,
      formId,
      error: error?.message || String(error),
      formQuestionImages: 0,
      formOptionImages: 0,
      dbQuestionImages: quiz.questions.filter((link: any) => hasImageTag(link.question.text)).length,
      questionUpdates: 0,
      optionUpdates: 0,
      unmapped: [],
    };
  }

  const usedQuestionIds = new Set<string>();
  let formQuestionImages = 0;
  let formOptionImages = 0;
  let questionUpdates = 0;
  let optionUpdates = 0;
  const unmapped: Array<{ formIndex: number; title: string; reason: string }> = [];

  for (let index = 0; index < (form.items || []).length; index++) {
    const item = (form.items || [])[index];
    const formIndex = index + 1;
    const title = item.title || "";
    if (isSurveyItem(title)) continue;

    const questionItem = item.questionItem;
    if (!questionItem?.question) continue;

    const itemHasQuestionImage = hasGoogleImage(questionItem.image);
    const choiceOptions = questionItem.question.choiceQuestion?.options || [];
    const itemOptionImageCount = choiceOptions.filter((option: any) => hasGoogleImage(option.image)).length;
    if (!itemHasQuestionImage && itemOptionImageCount === 0) continue;

    formQuestionImages += itemHasQuestionImage ? 1 : 0;
    formOptionImages += itemOptionImageCount;

    const link = findLinkForItem(quiz, formIndex, title, usedQuestionIds);
    if (!link) {
      unmapped.push({ formIndex, title, reason: "No matching DB question" });
      continue;
    }

    usedQuestionIds.add(link.questionId);
    if (await updateQuestionImage(prisma, auth, link, questionItem.image, apply)) questionUpdates++;
    optionUpdates += await updateOptionImages(prisma, auth, link, choiceOptions, apply);
  }

  const dbQuestionImages = quiz.questions.filter((link: any) => hasImageTag(link.question.text)).length;
  const dbOptionImages = quiz.questions.reduce(
    (sum: any, link: any) => sum + link.question.options.filter((option: any) => hasImageTag(option.text)).length,
    0,
  );

  return {
    quizId: quiz.id,
    title: quiz.title,
    formId,
    formQuestionImages,
    formOptionImages,
    dbQuestionImages,
    dbOptionImages,
    questionUpdates,
    optionUpdates,
    unmapped,
  };
}

async function main() {
  loadEnvFile();
  const originalConsoleLog = console.log.bind(console);
  console.log = (...args: unknown[]) => {
    if (typeof args[0] === "string" && args[0].startsWith("prisma:query")) return;
    originalConsoleLog(...args);
  };

  const apply = process.argv.includes("--apply");
  const quizArg = process.argv.find((arg) => arg.startsWith("--quiz="));
  const quizId = quizArg?.split("=")[1];
  const limitArg = process.argv.find((arg) => arg.startsWith("--limit="));
  const limit = limitArg ? Number(limitArg.split("=")[1]) : null;

  const auth = await getAuth();
  const forms = google.forms({ version: "v1", auth });
  const { prisma } = await import("../src/lib/prisma");
  prismaForDisconnect = prisma;

  const quizzes = await loadQuizzes(prisma, quizId);
  const selectedQuizzes = Number.isFinite(limit) && limit ? quizzes.slice(0, limit) : quizzes;
  const report = [];

  console.log(`${apply ? "Applying" : "Auditing"} Google Form images for ${selectedQuizzes.length} quiz(es)...`);

  for (const [index, quiz] of selectedQuizzes.entries()) {
    const result = await processQuiz(prisma, auth, forms, quiz, apply);
    if (!result) continue;
    report.push(result);
    const hasWork = result.questionUpdates || result.optionUpdates || result.unmapped.length || result.error;
    if (hasWork) {
      console.log(`[${index + 1}/${selectedQuizzes.length}] ${quiz.title}: q+${result.questionUpdates}, opt+${result.optionUpdates}, unmapped ${result.unmapped.length}${result.error ? `, error ${result.error}` : ""}`);
    }
  }

  const summary = {
    mode: apply ? "apply" : "dry-run",
    quizzesChecked: report.length,
    quizzesWithFormImages: report.filter((item) => item.formQuestionImages || item.formOptionImages).length,
    quizzesNeedingUpdates: report.filter((item) => item.questionUpdates || item.optionUpdates).length,
    questionImagesInForms: report.reduce((sum, item) => sum + item.formQuestionImages, 0),
    optionImagesInForms: report.reduce((sum, item) => sum + item.formOptionImages, 0),
    questionImageUpdates: report.reduce((sum, item) => sum + item.questionUpdates, 0),
    optionImageUpdates: report.reduce((sum, item) => sum + item.optionUpdates, 0),
    unmappedItems: report.reduce((sum, item) => sum + item.unmapped.length, 0),
    errors: report.filter((item) => item.error).length,
  };

  fs.writeFileSync(
    "form_image_backfill_report.json",
    JSON.stringify({ summary, report }, null, 2),
  );
  console.log(JSON.stringify(summary, null, 2));
  console.log("Report written to form_image_backfill_report.json");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prismaForDisconnect?.$disconnect();
  });
