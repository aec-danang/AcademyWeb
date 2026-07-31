"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { storageService } from "@/lib/storage/storage.service";

export async function autoClassifyByAI(title: string, contentSnippet: string) {
  const prompt = `Phân tích tiêu đề và nội dung ngắn gọn sau đây để phân loại vào 1 trong 4 loại: "post", "news", "event", "recruitment".
Đồng thời xuất ra mảng tối đa 4 thẻ (tags) phù hợp.

- "recruitment": tuyển dụng, tìm việc.
- "news": thông báo, nghỉ lễ, khai giảng, kết quả.
- "event": sự kiện, cuộc thi, workshop, trại hè.
- "post": blog kiến thức, mẹo học tập, IELTS, TOEIC.

Tiêu đề: ${title}
Nội dung: ${contentSnippet.substring(0, 600)}

Chỉ trả về đúng MỘT chuỗi JSON hợp lệ:
{
  "type": "...",
  "tags": ["..."]
}
Tuyệt đối không giải thích, không chào hỏi, không thêm bất kỳ văn bản nào khác ngoài JSON.`;

  try {
    const response = await fetch('http://127.0.0.1:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen2.5-coder:7b',
        prompt: prompt,
        stream: false,
        format: 'json'
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    const text = data.response || "";
    const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Lỗi AI Ollama:", e);
    return { type: "post", tags: [] };
  }
}

export async function createPost(data: any) {
  let uniqueSlug = data.slug;
  let counter = 1;
  while (true) {
    const existing = await prisma.post.findUnique({ where: { slug: uniqueSlug } });
    if (!existing) break;
    uniqueSlug = `${data.slug}-${counter}`;
    counter++;
  }
  data.slug = uniqueSlug;

  await prisma.post.create({
    data,
  });
  revalidatePath("/management/posts");
}

export async function updatePost(slug: string, data: any) {
  await prisma.post.update({
    where: { slug },
    data,
  });
  revalidatePath("/management/posts");
}

export async function deletePost(slug: string) {
  const post = await prisma.post.findUnique({
    where: { slug },
    select: { featuredImageId: true },
  });

  await prisma.post.delete({
    where: { slug },
  });

  // Garbage collection for Cloudinary Media if no longer referenced
  if (post?.featuredImageId) {
    const usageCount = await prisma.post.count({
      where: { featuredImageId: post.featuredImageId },
    });
    if (usageCount === 0) {
      await storageService.deleteMedia(post.featuredImageId);
    }
  }

  revalidatePath("/management/posts");
}

export async function batchDeletePosts(slugs: string[]) {
  const posts = await prisma.post.findMany({
    where: { slug: { in: slugs } },
    select: { featuredImageId: true },
  });

  await prisma.post.deleteMany({
    where: { slug: { in: slugs } },
  });

  // Garbage collection for deleted posts
  for (const post of posts) {
    if (post.featuredImageId) {
      const usageCount = await prisma.post.count({
        where: { featuredImageId: post.featuredImageId },
      });
      if (usageCount === 0) {
        await storageService.deleteMedia(post.featuredImageId);
      }
    }
  }

  revalidatePath("/management/posts");
}

export async function batchUpdatePosts(slugs: string[], data: any) {
  await prisma.post.updateMany({
    where: { slug: { in: slugs } },
    data,
  });
  revalidatePath("/management/posts");
}
