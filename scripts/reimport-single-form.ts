import 'dotenv/config';
import { prisma } from '../src/lib/prisma';
import { google } from 'googleapis';
import * as fs from 'fs';

const TOKEN_PATH = "e:/AEC/google-form-import-test/token.json";
const CREDENTIALS_PATH = "e:/AEC/google-form-import-test/credentials.json";
import { join } from 'path';

async function downloadImage(auth: any, contentUri: string): Promise<string> {
    try {
        const token = await auth.getAccessToken();
        const res = await fetch(contentUri, {
            headers: {
                Authorization: `Bearer ${token.token}`
            }
        });
        
        if (!res.ok) {
            console.error("Failed to download image", contentUri, res.statusText);
            return contentUri;
        }
        
        const publicDir = join(process.cwd(), 'public', 'uploads', 'forms');
        if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir, { recursive: true });
        }
        
        const contentType = res.headers.get('content-type') || 'image/jpeg';
        let ext = 'jpg';
        if (contentType.includes('png')) ext = 'png';
        else if (contentType.includes('gif')) ext = 'gif';
        
        const filename = `img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`;
        const filePath = join(publicDir, filename);
        
        const arrayBuffer = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        fs.writeFileSync(filePath, buffer);
        
        return `/uploads/forms/${filename}`;
    } catch (e) {
        console.error("Error downloading image", e);
        return contentUri;
    }
}

async function getAuth() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf8"));
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  oAuth2Client.setCredentials(JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8")));
  return oAuth2Client;
}

async function reimport() {
    const auth = await getAuth();
    const oldQuizId = 'cmqypaz8j0feam4usunfbky3z';
    const formId = '1dnAeIFNvCBSZM9JE5iM7L9hg_7vZamaEr7Oe0HZ8Afs';
    const title = 'TO75.P-10 (LISTENING)';
    const unit = '4';

    console.log("Deleting old quiz questions...");
    // Find all questions linked to this quiz
    const quizQuestions = await prisma.quizQuestion.findMany({
        where: { quizId: oldQuizId }
    });
    const questionIds = quizQuestions.map(qq => qq.questionId);

    // Delete QuizQuestion links
    await prisma.quizQuestion.deleteMany({
        where: { quizId: oldQuizId }
    });

    // Delete Questions (options will cascade if QuestionOption relates to Question onDelete: Cascade)
    await prisma.question.deleteMany({
        where: { id: { in: questionIds } }
    });

    console.log("Fetching new form data...");
    const forms = google.forms({ version: "v1", auth });
    const res = await forms.forms.get({ formId });
    const form = res.data;

    let order = 0;
    let questionsCreated = 0;
    
    for (const item of (form.items || [])) {
        const questionItem = item.questionItem;
        const groupItem = item.questionGroupItem;
        const imageItem = item.imageItem;
        const videoItem = item.videoItem;
        const textItem = item.textItem;

        if (!questionItem && !groupItem && !imageItem && !videoItem && !textItem) continue;
        
        let text = item.title || "";
        const lowerText = text.toLowerCase();
        const surveyKeywords = [
            "họ và tên", "họ tên", "mã sinh viên", "mã học viên", "email", "sđt", "số điện thoại", "lớp", "your name", "student id",
            "học viên academy", "birthday", "ngày sinh", "ngay sinh", "parent's name", "tên bố", "tên mẹ", "nghề nghiệp", "job", "target score", "điểm số mục tiêu"
        ];
        if (text.length < 100 && surveyKeywords.some((keyword) => lowerText.includes(keyword))) {
            continue;
        }

        if (imageItem || videoItem || textItem) {
            let mediaText = text;
            if (item.description) {
                mediaText += `\n${item.description}`;
            }
            if (imageItem?.image?.contentUri) {
                const localUri = await downloadImage(auth, imageItem.image.contentUri as string);
                mediaText += `\n[Image: ${localUri}]`;
            }
            if (videoItem?.video?.youtubeUri) {
                let yUri = videoItem.video.youtubeUri;
                if (!yUri.startsWith('http')) yUri = 'https://' + yUri;
                mediaText += `\n[Video: ${yUri}]`;
            }

            const question = await prisma.question.create({
                data: {
                    type: "READING",
                    text: mediaText.trim(),
                    points: 0,
                }
            });

            await prisma.quizQuestion.create({
                data: {
                    quizId: oldQuizId,
                    questionId: question.id,
                    points: 0,
                    order: order
                }
            });
            questionsCreated++;
            continue;
        }

        if (groupItem) {
            let commonText = text;
            if (groupItem.image && groupItem.image.contentUri) {
                const localUri = await downloadImage(auth, groupItem.image.contentUri as string);
                commonText += `\n[Image: ${localUri}]`;
            }

            const options = groupItem.grid?.columns?.options || [];
            
            for (const rowQ of groupItem.questions || []) {
                order++;
                const rowText = `${commonText}\n\n${rowQ.rowQuestion?.title || ""}`.trim();
                const pointValue = rowQ.grading?.pointValue || 0;
                
                let correctAnswers: string[] = [];
                if (rowQ.grading?.correctAnswers?.answers) {
                    correctAnswers = rowQ.grading.correctAnswers.answers.map((a: any) => a.value);
                }
                let answerKey = correctAnswers.join(" | ");

                const optionsData = [];
                let optOrder = 0;
                for (const opt of options) {
                    optOrder++;
                    optionsData.push({
                        text: opt.value || "",
                        isCorrect: correctAnswers.includes(opt.value),
                        order: optOrder
                    });
                }

                const question = await prisma.question.create({
                    data: {
                        type: "MULTIPLE_CHOICE",
                        text: rowText,
                        points: pointValue,
                        answerKey: answerKey,
                        options: { create: optionsData }
                    }
                });

                await prisma.quizQuestion.create({
                    data: {
                        quizId: oldQuizId,
                        questionId: question.id,
                        points: pointValue,
                        order: order
                    }
                });
                questionsCreated++;
            }
            continue;
        }

        const q = questionItem!.question;
        if (!q) continue;
        
        order++;
        let type: any = "MULTIPLE_CHOICE";
        if (q.textQuestion) type = "SHORT_ANSWER";

        if (questionItem!.image?.contentUri) {
            const localUri = await downloadImage(auth, questionItem!.image.contentUri as string);
            text += `\n[Image: ${localUri}]`;
        }

        const pointValue = q.grading?.pointValue || 0;
        
        const optionsData = [];
        let correctAnswers: string[] = [];
        if (q.grading?.correctAnswers?.answers) {
            correctAnswers = q.grading.correctAnswers.answers.map((a: any) => a.value);
        }
        let answerKey = correctAnswers.join(" | ");

        if (q.choiceQuestion) {
            let optOrder = 0;
            for (const opt of q.choiceQuestion.options || []) {
                optOrder++;
                optionsData.push({
                    text: opt.value || "",
                    isCorrect: correctAnswers.includes(opt.value),
                    order: optOrder
                });
            }
        }

        const question = await prisma.question.create({
            data: {
                type: type,
                text: text,
                points: pointValue,
                answerKey: answerKey,
                options: { create: optionsData }
            }
        });

        await prisma.quizQuestion.create({
            data: {
                quizId: oldQuizId,
                questionId: question.id,
                points: pointValue,
                order: order
            }
        });
        questionsCreated++;
    }

    console.log(`Re-import complete! Created ${questionsCreated} questions.`);
}

reimport().catch(console.error).finally(() => prisma.$disconnect());
