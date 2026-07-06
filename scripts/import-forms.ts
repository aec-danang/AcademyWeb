import 'dotenv/config';
import { prisma } from '../src/lib/prisma';
import * as xlsx from 'xlsx';
import { google } from 'googleapis';
import * as fs from 'fs';

const TOKEN_PATH = "e:/AEC/google-form-import-test/token.json";
const CREDENTIALS_PATH = "e:/AEC/google-form-import-test/credentials.json";
const PROGRESS_FILE = "import_progress.json";
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

function normalizeName(name: string) {
    if (!name) return "";
    let n = name.trim().toLowerCase();
    n = n.replace(/^bản sao của\s+/i, '');
    n = n.replace(/–/g, '-');
    n = n.replace(/\s+/g, ' ');
    return n;
}

async function getAllDriveForms(auth: any) {
    const drive = google.drive({ version: 'v3', auth });
    let pageToken = undefined;
    const formsMap = new Map<string, string>();
    
    console.log("Fetching all forms from Google Drive...");
    do {
        const res: any = await drive.files.list({
            q: "mimeType='application/vnd.google-apps.form'",
            pageSize: 1000,
            pageToken: pageToken,
            fields: 'nextPageToken, files(id, name)',
        });
        
        for (const file of res.data.files) {
            if (file.name && file.id) {
                formsMap.set(normalizeName(file.name), file.id);
            }
        }
        pageToken = res.data.nextPageToken;
    } while (pageToken);
    
    console.log(`Found ${formsMap.size} forms in Google Drive.`);
    return formsMap;
}

async function importForm(auth: any, formId: string, rowData: any) {
    const forms = google.forms({ version: "v1", auth });
    let res;
    try {
        res = await forms.forms.get({ formId });
    } catch (e: any) {
        console.error(`Cannot fetch form ${formId}`, e.message);
        return false;
    }
    const form = res.data;
    const title = rowData['Tên Unit'] || form.info?.title || "Untitled";
    const sourceGroup = rowData['GIÁO_TRÌNH'] || null;
    const programName = rowData['CHƯƠNG TRÌNH'] || null;

    // Check if Program exists
    let program = null;
    if (programName) {
        const existingProgram = await prisma.program.findUnique({
            where: { code: programName }
        });
        if (existingProgram) {
            program = existingProgram;
        } else {
            program = await prisma.program.create({
                data: { code: programName, name: programName }
            });
        }
    }

    // Create Quiz
    const quiz = await prisma.quiz.create({
        data: {
            title: title,
            description: form.info?.description || "",
            unit: rowData['Tên Unit'],
            sourceGroup: sourceGroup,
            programId: program?.id,
            importSource: formId,
            isPracticeTest: true,
            published: true,
        }
    });

    let order = 0;
    for (const item of (form.items || [])) {
        order++;
        const questionItem = item.questionItem;
        const groupItem = item.questionGroupItem;
        const imageItem = item.imageItem;
        const videoItem = item.videoItem;
        const textItem = item.textItem;

        if (!questionItem && !groupItem && !imageItem && !videoItem && !textItem) {
            continue;
        }
        
        let text = item.title || "";

        // Skip survey/personal info questions
        const lowerText = text.toLowerCase();
        const surveyKeywords = [
            "họ và tên", "họ tên", "mã sinh viên", "mã học viên", "email", "sđt", "số điện thoại", "lớp", "your name", "student id",
            "học viên academy", "birthday", "ngày sinh", "ngay sinh", "parent's name", "tên bố", "tên mẹ", "nghề nghiệp", "job", "target score", "điểm số mục tiêu"
        ];
        if (text.length < 100 && surveyKeywords.some((keyword) => lowerText.includes(keyword))) {
            console.log(`Bỏ qua câu hỏi khảo sát: "${text}"`);
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
                    quizId: quiz.id,
                    questionId: question.id,
                    points: 0,
                    order: order
                }
            });
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
                    const isCorrect = correctAnswers.includes(opt.value);
                    optionsData.push({
                        text: opt.value || "",
                        isCorrect: isCorrect,
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
                        quizId: quiz.id,
                        questionId: question.id,
                        points: pointValue,
                        order: order
                    }
                });
            }
            continue;
        }

        const q = questionItem!.question;
        if (!q) continue;
        
        let type: any = "MULTIPLE_CHOICE";
        if (q.textQuestion) type = "SHORT_ANSWER";

        if (questionItem!.image?.contentUri) {
            const localUri = await downloadImage(auth, questionItem!.image.contentUri as string);
            text += `\n[Image: ${localUri}]`;
        }

        const pointValue = q.grading?.pointValue || 0;
        
        // Options
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
                const isCorrect = correctAnswers.includes(opt.value);
                optionsData.push({
                    text: opt.value || "",
                    isCorrect: isCorrect,
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
                options: {
                    create: optionsData
                }
            }
        });

        // Link to Quiz
        await prisma.quizQuestion.create({
            data: {
                quizId: quiz.id,
                questionId: question.id,
                points: pointValue,
                order: order
            }
        });
    }
    
    return true;
}

async function main() {
    console.log("Authenticating...");
    const auth = await getAuth();
    
    let progress: Record<string, boolean> = {};
    if (fs.existsSync(PROGRESS_FILE)) {
        progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, "utf8"));
    }

    const driveForms = await getAllDriveForms(auth);

    console.log("Reading excel file...");
    const workbook = xlsx.readFile('e:\\AEC\\Quản lý Progress Test (1).xlsx');
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);
    
    // Run all data
    const testData = data;
    console.log(`Found ${data.length} records in Excel. Running all...`);

    for (const row of testData) {
        const title = (row as any)['Tên Unit'];
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

        const success = await importForm(auth, formId, row);
        if (success) {
            progress[title] = true;
            fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
            console.log("Imported successfully:", title);
        }
    }
    console.log("Done testing. If successful, you can change testData to data in script to run all.");
}

main().catch(console.error);
