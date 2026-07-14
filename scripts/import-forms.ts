/* eslint-disable @typescript-eslint/no-explicit-any */
import * as fs from "fs";
import * as xlsx from "xlsx";
import { google } from "googleapis";
import {
  appendGroupImage,
  appendQuestionImage,
  firstVideoUrlFromForm,
  inferExamSkill,
  isListeningTitle,
  isSurveyItem,
  mediaTextForStandaloneItem,
  normalizeName,
  optionTextWithImage,
  getGoogleAuth
} from "./form-import-utils";

const PROGRESS_FILE = "import_progress.json";
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

function rowValue(row: Record<string, unknown>, candidates: string[]) {
  for (const key of candidates) {
    const value = row[key];
    if (value !== undefined && value !== null && String(value).trim()) return String(value).trim();
  }

  const normalizedCandidates = candidates.map(normalizeName);
  for (const [key, value] of Object.entries(row)) {
    if (value === undefined || value === null || !String(value).trim()) continue;
    const normalizedKey = normalizeName(key);
    if (normalizedCandidates.some((candidate) => normalizedKey.includes(candidate) || candidate.includes(normalizedKey))) {
      return String(value).trim();
    }
  }

  return null;
}


async function getAllDriveForms(auth: any) {
  const drive = google.drive({ version: "v3", auth });
  let pageToken: string | undefined;
  const formsMap = new Map<string, string>();

  console.log("Fetching all forms from Google Drive...");
  do {
    const res: any = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.form'",
      pageSize: 1000,
      pageToken,
      fields: "nextPageToken, files(id, name)",
    });

    for (const file of res.data.files || []) {
      if (file.name && file.id) {
        formsMap.set(normalizeName(file.name), file.id);
      }
    }
    pageToken = res.data.nextPageToken;
  } while (pageToken);

  console.log(`Found ${formsMap.size} forms in Google Drive.`);
  return formsMap;
}

async function importForm(prisma: any, auth: any, formId: string, rowData: Record<string, unknown>) {
  const forms = google.forms({ version: "v1", auth });
  let res;
  try {
    res = await forms.forms.get({ formId });
  } catch (e: any) {
    console.error(`Cannot fetch form ${formId}`, e.message);
    return false;
  }

  const form = res.data;
  const title = rowValue(rowData, ["Tên Unit", "TÃªn Unit", "Unit"]) || form.info?.documentTitle || form.info?.title || "Untitled";
  const sourceTitle = form.info?.documentTitle || form.info?.title || null;
  const sourceGroup = rowValue(rowData, ["GIÁO TRÌNH", "GIÃO TRÃŒNH", "Giáo trình"]);
  const programName = rowValue(rowData, ["CHƯƠNG TRÌNH", "CHÆ¯Æ NG TRÃŒNH", "Chương trình"]);
  const firstVideoUrl = firstVideoUrlFromForm(form);
  const skill = inferExamSkill(title, sourceTitle);

  let program = null;
  if (programName) {
    program =
      (await prisma.program.findUnique({ where: { code: programName } })) ||
      (await prisma.program.create({ data: { code: programName, name: programName } }));
  }

  const quiz = await prisma.quiz.create({
    data: {
      title,
      description: form.info?.description || "",
      unit: title,
      sourceGroup,
      sourceTitle,
      programId: program?.id,
      importSource: formId,
      isPracticeTest: true,
      examType: /toeic/i.test(`${title} ${sourceGroup || ""}`) ? "TOEIC" : "GENERAL",
      skill,
      audioUrl: isListeningTitle(title) || skill === "LISTENING" ? firstVideoUrl : null,
      published: true,
    },
  });

  let order = 0;
  for (const item of form.items || []) {
    const questionItem = item.questionItem;
    const groupItem = item.questionGroupItem;
    const imageItem = item.imageItem;
    const videoItem = item.videoItem;
    const textItem = item.textItem;
    const pageBreakItem = item.pageBreakItem;

    if (!questionItem && !groupItem && !imageItem && !videoItem && !textItem && !pageBreakItem) continue;

    const titleText = item.title || "";
    if (isSurveyItem(titleText)) {
      console.log(`Skipping survey/personal-info item: "${titleText}"`);
      continue;
    }

    if (imageItem || videoItem || textItem || pageBreakItem) {
      const mediaText = await mediaTextForStandaloneItem(auth, item);
      if (!mediaText) continue;

      order++;
      const question = await prisma.question.create({
        data: {
          type: "READING",
          text: mediaText,
          points: 0,
          sourceOrder: order,
          sourceType: pageBreakItem ? "SECTION" : videoItem ? "VIDEO" : imageItem ? "IMAGE" : "TEXT",
          importSource: formId,
        },
      });

      await prisma.quizQuestion.create({
        data: { quizId: quiz.id, questionId: question.id, points: 0, order },
      });
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
          data: { quizId: quiz.id, questionId: question.id, points: pointValue, order },
        });
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
      data: { quizId: quiz.id, questionId: question.id, points: pointValue, order },
    });
  }

  return true;
}

async function main() {
  loadEnvFile();
  console.log("Authenticating...");
  const auth = await getGoogleAuth();
  const { prisma } = await import("../src/lib/prisma");
  prismaForDisconnect = prisma;

  let progress: Record<string, boolean> = {};
  if (fs.existsSync(PROGRESS_FILE)) {
    progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, "utf8"));
  }

  const driveForms = await getAllDriveForms(auth);
  
  // Try taking the excel path from the command line argument first, then the ENV var.
  const excelPath = process.argv[2] || process.env.PROGRESS_TEST_EXCEL_PATH;
  
  if (!excelPath || !fs.existsSync(excelPath)) {
    console.error(`\n[ERROR] Missing or invalid Excel file path.`);
    console.error(`Usage: npx tsx scripts/import-forms.ts <path-to-excel-file>`);
    console.error(`Example: npx tsx scripts/import-forms.ts ./forms.xlsx\n`);
    process.exit(1);
  }

  console.log(`Reading excel file: ${excelPath}`);
  const workbook = xlsx.readFile(excelPath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json<Record<string, unknown>>(sheet);
  console.log(`Found ${data.length} records in Excel. Running all...`);

  for (const row of data) {
    const title = rowValue(row, ["Tên Unit", "TÃªn Unit", "Unit"]);
    if (!title) continue;

    if (progress[title]) {
      console.log("Skipping already imported:", title);
      continue;
    }

    const normTitle = normalizeName(title);
    const formId = driveForms.get(normTitle);

    if (!formId) {
      console.log(`Could not find formId in Drive for: ${title} (normalized: ${normTitle})`);
      continue;
    }

    console.log(`Processing: ${title} -> ${formId}`);
    const success = await importForm(prisma, auth, formId, row);
    if (success) {
      progress[title] = true;
      fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
      console.log("Imported successfully:", title);
    }
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prismaForDisconnect?.$disconnect();
  });
