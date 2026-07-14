import { google } from 'googleapis';
import 'dotenv/config';
import * as fs from 'fs';
import { prisma } from '../src/lib/prisma';
import { getGoogleAuth } from './form-import-utils';

async function main() {
  const auth = await getGoogleAuth();
  const formId = process.argv[2] || '1wvUD9SqljGpbhVZmfCYl3woW90dNQGRMSKyq1LCBLos';
  
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
