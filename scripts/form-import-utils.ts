/* eslint-disable @typescript-eslint/no-explicit-any */
import * as fs from "fs";
import { join } from "path";

function loadLocalEnvFile() {
  if (!fs.existsSync(".env")) return;
  const envText = fs.readFileSync(".env", "utf8");
  for (const line of envText.split(/\r?\n/)) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*"?([^"\r\n]*)"?\s*$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2];
    }
  }
}

loadLocalEnvFile();

export const TOKEN_PATH = process.env.GOOGLE_TOKEN_PATH || "e:/AEC/google-form-import-test/token.json";
export const CREDENTIALS_PATH = process.env.GOOGLE_CREDENTIALS_PATH || "e:/AEC/google-form-import-test/credentials.json";

const SURVEY_KEYWORDS = [
  "họ và tên",
  "họ tên",
  "mã sinh viên",
  "mã học viên",
  "email",
  "sđt",
  "số điện thoại",
  "lớp",
  "your name",
  "student id",
  "học viên academy",
  "birthday",
  "ngày sinh",
  "ngay sinh",
  "parent's name",
  "tên bố",
  "tên mẹ",
  "nghề nghiệp",
  "job",
  "target score",
  "điểm số mục tiêu",
  "há» vã  tên",
  "há» tên",
  "mã£ sinh viên",
  "mã£ há»c viên",
  "sä‘t",
  "sá»‘ ä‘iá»‡n thoáº¡i",
  "lá»›p",
  "há»c viên academy",
  "ngã y sinh",
  "tên bá»‘",
  "tên máº¹",
  "nghá» nghiá»‡p",
  "ä‘iá»ƒm sá»‘ má»¥c tiêu",
];

export function normalizeName(name: string) {
  if (!name) return "";
  let n = name.trim().toLowerCase();
  n = n.replace(/^bản sao của\s+/i, "");
  n = n.replace(/^báº£n sao cá»§a\s+/i, "");
  n = n.replace(/â€“/g, "-");
  n = n.replace(/\s+/g, " ");
  return n;
}

export function isSurveyItem(title: string) {
  const lowerText = title.toLowerCase();
  return title.length < 100 && SURVEY_KEYWORDS.some((keyword) => lowerText.includes(keyword));
}

export function normalizeMediaUrl(url: string) {
  if (!url) return "";
  let value = url.trim();
  if (value && !/^https?:\/\//i.test(value) && /^(www\.|youtu\.be\/|youtube\.com\/)/i.test(value)) {
    value = `https://${value}`;
  }
  return value;
}

export function isListeningTitle(value: string | null | undefined) {
  return Boolean(value && /listening|nghe/i.test(value));
}

export function inferExamSkill(title: string, sourceTitle?: string | null) {
  const haystack = `${title} ${sourceTitle || ""}`;
  if (isListeningTitle(haystack)) return "LISTENING";
  if (/reading|đọc|doc/i.test(haystack)) return "READING";
  return "GRAMMAR";
}

function extensionFromContentType(contentType: string) {
  if (contentType.includes("png")) return "png";
  if (contentType.includes("gif")) return "gif";
  if (contentType.includes("webp")) return "webp";
  if (contentType.includes("svg")) return "svg";
  return "jpg";
}

export async function downloadImage(auth: any, contentUri: string): Promise<string> {
  try {
    const token = await auth.getAccessToken();
    const res = await fetch(contentUri, {
      headers: {
        Authorization: `Bearer ${token.token}`,
      },
    });

    if (!res.ok) {
      console.error("Failed to download image", contentUri, res.statusText);
      return contentUri;
    }

    const publicDir = join(process.cwd(), "public", "uploads", "forms");
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    const contentType = res.headers.get("content-type") || "image/jpeg";
    const ext = extensionFromContentType(contentType);
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

export async function imageTagFromGoogleImage(auth: any, image: any) {
  const uri = image?.contentUri;
  if (!uri) return "";
  const localUri = await downloadImage(auth, uri as string);
  return `[Image: ${localUri}]`;
}

export function videoTagFromGoogleVideo(video: any) {
  const youtubeUri = video?.youtubeUri;
  if (!youtubeUri) return "";
  return `[Video: ${normalizeMediaUrl(youtubeUri as string)}]`;
}

export function addLine(text: string, line: string | null | undefined) {
  const value = line?.trim();
  if (!value) return text;
  return text ? `${text}\n${value}` : value;
}

export async function mediaTextForStandaloneItem(auth: any, item: any) {
  let mediaText = item.title || "";
  mediaText = addLine(mediaText, item.description);
  mediaText = addLine(mediaText, await imageTagFromGoogleImage(auth, item.imageItem?.image));
  mediaText = addLine(mediaText, videoTagFromGoogleVideo(item.videoItem?.video));
  return mediaText.trim();
}

export async function appendQuestionImage(auth: any, text: string, questionItem: any) {
  let nextText = addLine(text, questionItem?.description);
  nextText = addLine(nextText, await imageTagFromGoogleImage(auth, questionItem?.image));
  return nextText;
}

export async function appendGroupImage(auth: any, text: string, groupItem: any) {
  let nextText = addLine(text, groupItem?.description);
  nextText = addLine(nextText, await imageTagFromGoogleImage(auth, groupItem?.image));
  return nextText;
}

export async function optionTextWithImage(auth: any, option: any) {
  let text = option?.value || "";
  text = addLine(text, await imageTagFromGoogleImage(auth, option?.image));
  return text;
}

export function firstVideoUrlFromForm(form: any) {
  for (const item of form.items || []) {
    const videoUrl = normalizeMediaUrl(item.videoItem?.video?.youtubeUri || "");
    if (videoUrl) return videoUrl;
  }
  return null;
}
