import { prisma } from './src/lib/prisma';

async function generateMeta(title: string, contentSnippet: string) {
  const prompt = `Bạn là một chuyên gia content SEO. Hãy đọc tiêu đề và đoạn trích nội dung bài viết dưới đây.
Nhiệm vụ của bạn là viết ra 2 trường:
1. "excerpt": Một đoạn tóm tắt nội dung bài viết siêu ngắn gọn (khoảng 2 câu).
2. "metaDescription": Một câu mô tả thật hấp dẫn, có chứa từ khóa của bài viết và tuyệt đối PHẢI DƯỚI 160 ký tự (chuẩn SEO của Google).

Tiêu đề: ${title}
Nội dung: ${contentSnippet.substring(0, 800)}

Chỉ trả về đúng MỘT chuỗi JSON hợp lệ với format sau:
{
  "excerpt": "...",
  "metaDescription": "..."
}
Tuyệt đối không giải thích, không thêm text nào khác ngoài JSON.`;

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

    if (!response.ok) return null;

    const data = await response.json();
    const text = data.response || "";
    const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (e) {
    return null;
  }
}

async function main() {
  console.log('🚀 Bắt đầu quét các bài viết thiếu Excerpt / Meta Description...');
  
  const posts = await prisma.post.findMany({
    where: {
      OR: [
        { excerpt: null },
        { excerpt: '' },
        { metaDescription: null },
        { metaDescription: '' }
      ]
    },
    select: { id: true, title: true, content: true, slug: true }
  });

  console.log(`Đã tìm thấy ${posts.length} bài viết cần xử lý.`);
  let success = 0;
  let errors = 0;

  for (const post of posts) {
    try {
      console.log(`[AI] Đang viết meta cho bài: "${post.title}"...`);
      const cleanContent = post.content.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ');
      const aiResult = await generateMeta(post.title, cleanContent);
      
      if (aiResult && aiResult.excerpt && aiResult.metaDescription) {
        await prisma.post.update({
          where: { id: post.id },
          data: {
            excerpt: aiResult.excerpt.substring(0, 300), // safety limit
            metaDescription: aiResult.metaDescription.substring(0, 160) // strict SEO limit
          }
        });
        console.log(`✅ Thành công - ${post.slug}`);
        success++;
      } else {
        console.log(`⚠️ AI trả về dữ liệu lỗi cho bài ${post.slug}`);
        errors++;
      }
    } catch (err) {
      console.error(`❌ Lỗi update bài ${post.slug}:`, err.message);
      errors++;
    }
  }

  console.log('\n=======================================');
  console.log('🎉 ĐÃ HOÀN THÀNH TẠO META SEO!');
  console.log(`- Thành công: ${success}`);
  console.log(`- Lỗi: ${errors}`);
  console.log('=======================================');
}

main().finally(() => prisma.$disconnect());
