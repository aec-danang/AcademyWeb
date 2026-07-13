import { google } from 'googleapis';
import 'dotenv/config';
import * as fs from 'fs';
import { prisma } from '../src/lib/prisma';

const TOKEN_PATH = "e:/AEC/google-form-import-test/token.json";
const CREDENTIALS_PATH = "e:/AEC/google-form-import-test/credentials.json";

async function getAuth() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf8"));
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  oAuth2Client.setCredentials(JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8")));
  return oAuth2Client;
}

async function main() {
  const auth = await getAuth();
  const formId = '1wvUD9SqljGpbhVZmfCYl3woW90dNQGRMSKyq1LCBLos';
  
  const forms = google.forms({ version: 'v1', auth });
  const res = await forms.forms.get({ formId });
  const form = res.data;
  
  console.log(`=== GOOGLE FORM DATA ===`);
  console.log(`Title: ${form.info?.title}`);
  
  let qCount = 0;
  let imgCount = 0;
  for (const item of (form.items || [])) {
    if (item.questionItem) {
      console.log(`- Q: ${item.title} (QuestionItem)`);
      qCount++;
    } else if (item.questionGroupItem) {
      console.log(`- Group: ${item.title} (QuestionGroupItem, ${item.questionGroupItem.questions?.length} rows)`);
      qCount += item.questionGroupItem.questions?.length || 0;
    } else if (item.imageItem) {
      console.log(`- Image: ${item.title} (ImageItem)`);
      imgCount++;
    }
  }
  
  console.log(`Total questions in Google Form: ${qCount}`);
  console.log(`Total standalone images in Google Form: ${imgCount}`);

  console.log(`\n=== PRISMA DB DATA ===`);
  const quiz = await prisma.quiz.findUnique({
      where: { id: 'cmqypsql30l6em4us5zin5uif' },
      include: { questions: { include: { question: true } } }
  });
  console.log(`Quiz Title: ${quiz?.title}`);
  console.log(`Questions in DB: ${quiz?.questions.length}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
