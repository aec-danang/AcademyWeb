/* eslint-disable @typescript-eslint/no-explicit-any */
import * as fs from "fs";
import { google } from "googleapis";
import {
  appendGroupImage,
  appendQuestionImage,
  CREDENTIALS_PATH,
  firstVideoUrlFromForm,
  inferExamSkill,
  isListeningTitle,
  isSurveyItem,
  mediaTextForStandaloneItem,
  optionTextWithImage,
  TOKEN_PATH,
} from "./form-import-utils";

const DEFAULT_QUIZ_ID = "cmqypaz8j0feam4usunfbky3z";
const DEFAULT_FORM_ID = "1dnAeIFNvCBSZM9JE5iM7L9hg_7vZamaEr7Oe0HZ8Afs";
const DEFAULT_TITLE = "TO75.P-10 (LISTENING)";
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
    throw new Error(
      `Missing Google API credentials. Expected credentials at ${CREDENTIALS_PATH} and token at ${TOKEN_PATH}. ` +
        "You can override them with GOOGLE_CREDENTIALS_PATH and GOOGLE_TOKEN_PATH."
    );
  }

  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf8"));
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  oAuth2Client.setCredentials(JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8")));
  return oAuth2Client;
}

async function createStandaloneQuestion(prisma: any, quizId: string, formId: string, item: any, auth: any, order: number) {
  const mediaText = await mediaTextForStandaloneItem(auth, item);
  if (!mediaText) return false;

  const question = await prisma.question.create({
    data: {
      type: "READING",
      text: mediaText,
      points: 0,
      sourceOrder: order,
      sourceType: item.pageBreakItem ? "SECTION" : item.videoItem ? "VIDEO" : item.imageItem ? "IMAGE" : "TEXT",
      importSource: formId,
    },
  });

  await prisma.quizQuestion.create({
    data: { quizId, questionId: question.id, points: 0, order },
  });

  return true;
}

async function reimport() {
  loadEnvFile();
  const auth = await getAuth();
  const { prisma } = await import("../src/lib/prisma");
  prismaForDisconnect = prisma;

  const quizId = process.env.QUIZ_ID || DEFAULT_QUIZ_ID;
  const formId = process.env.FORM_ID || DEFAULT_FORM_ID;
  const fallbackTitle = process.env.FORM_TITLE || DEFAULT_TITLE;

  console.log("Deleting old quiz questions...");
  const quizQuestions = await prisma.quizQuestion.findMany({ where: { quizId } });
  const questionIds = quizQuestions.map((qq) => qq.questionId);

  await prisma.quizQuestion.deleteMany({ where: { quizId } });
  await prisma.question.deleteMany({ where: { id: { in: questionIds } } });

  console.log("Fetching new form data...");
  const forms = google.forms({ version: "v1", auth });
  const res = await forms.forms.get({ formId });
  const form = res.data;
  const title = form.info?.documentTitle || fallbackTitle;
  const sourceTitle = form.info?.documentTitle || form.info?.title || null;
  const skill = inferExamSkill(title, sourceTitle);
  const firstVideoUrl = firstVideoUrlFromForm(form);

  await prisma.quiz.update({
    where: { id: quizId },
    data: {
      title,
      sourceTitle,
      importSource: formId,
      skill,
      audioUrl: isListeningTitle(title) || skill === "LISTENING" ? firstVideoUrl : null,
    },
  });

  let order = 0;
  let questionsCreated = 0;

  for (const item of form.items || []) {
    const questionItem = item.questionItem;
    const groupItem = item.questionGroupItem;
    const imageItem = item.imageItem;
    const videoItem = item.videoItem;
    const textItem = item.textItem;
    const pageBreakItem = item.pageBreakItem;

    if (!questionItem && !groupItem && !imageItem && !videoItem && !textItem && !pageBreakItem) continue;

    const titleText = item.title || "";
    if (isSurveyItem(titleText)) continue;

    if (imageItem || videoItem || textItem || pageBreakItem) {
      order++;
      if (await createStandaloneQuestion(prisma, quizId, formId, item, auth, order)) {
        questionsCreated++;
      }
      continue;
    }

    if (groupItem) {
      const commonText = await appendGroupImage(auth, titleText, groupItem);
      const options = groupItem.grid?.columns?.options || [];

      for (const rowQ of groupItem.questions || []) {
        order++;
        const rowText = `${commonText}\n\n${rowQ.rowQuestion?.title || ""}`.trim();
        const pointValue = rowQ.grading?.pointValue || 0;
        const correctAnswers = rowQ.grading?.correctAnswers?.answers?.map((a: any) => a.value) || [];

        const optionsData = [];
        let optOrder = 0;
        for (const opt of options) {
          optOrder++;
          optionsData.push({
            text: await optionTextWithImage(auth, opt),
            isCorrect: correctAnswers.includes(opt.value),
            order: optOrder,
          });
        }

        const question = await prisma.question.create({
          data: {
            type: "MULTIPLE_CHOICE",
            text: rowText,
            points: pointValue,
            answerKey: correctAnswers.join(" | "),
            sourceOrder: order,
            sourceType: "GRID",
            importSource: formId,
            options: { create: optionsData },
          },
        });

        await prisma.quizQuestion.create({
          data: { quizId, questionId: question.id, points: pointValue, order },
        });
        questionsCreated++;
      }
      continue;
    }

    const q = questionItem?.question;
    if (!q) continue;

    order++;
    const type = q.textQuestion ? "SHORT_ANSWER" : "MULTIPLE_CHOICE";
    const text = await appendQuestionImage(auth, titleText, questionItem);
    const pointValue = q.grading?.pointValue || 0;
    const correctAnswers = q.grading?.correctAnswers?.answers?.map((a: any) => a.value) || [];
    const optionsData = [];

    if (q.choiceQuestion) {
      let optOrder = 0;
      for (const opt of q.choiceQuestion.options || []) {
        optOrder++;
        optionsData.push({
          text: await optionTextWithImage(auth, opt),
          isCorrect: correctAnswers.includes(opt.value),
          order: optOrder,
        });
      }
    }

    const question = await prisma.question.create({
      data: {
        type,
        text,
        points: pointValue,
        answerKey: correctAnswers.join(" | "),
        sourceOrder: order,
        importSource: formId,
        options: { create: optionsData },
      },
    });

    await prisma.quizQuestion.create({
      data: { quizId, questionId: question.id, points: pointValue, order },
    });
    questionsCreated++;
  }

  console.log(`Re-import complete! Created ${questionsCreated} items/questions.`);
}

reimport()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prismaForDisconnect?.$disconnect();
  });
