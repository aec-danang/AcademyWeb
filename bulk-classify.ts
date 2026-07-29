import { prisma } from './src/lib/prisma';
import * as dotenv from 'dotenv';
dotenv.config();

// Sleep utility for rate limiting
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function classifyWithAI(title: string, contentSnippet: string) {
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
Không giải thích gì thêm.`;

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
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error('AI classification failed:', e);
    return null;
  }
}

async function main() {
  console.log('🚀 Bắt đầu quét phân loại Hybrid (Từ khóa + AI) cho toàn bộ bài viết...');
  
  const posts = await prisma.post.findMany({
    select: { id: true, title: true, content: true, type: true, tags: true, slug: true }
  });

  console.log(`Đã tìm thấy ${posts.length} bài viết.`);
  
  let stats = {
    total: posts.length,
    byKeyword: 0,
    byAI: 0,
    skipped: 0,
    errors: 0
  };

  for (const post of posts) {
    try {
      const textToAnalyze = (post.title + ' ' + post.content).toLowerCase();
      let detectedType = null;
      let detectedTags: string[] = [];
      let isStrongMatch = false;
      
      // LỚP 1: TỪ KHÓA (Keyword Heuristics)
      if (/(tuyển dụng|hiring|tìm việc|tuyển giáo viên|tuyển trợ giảng|tuyển nhân viên)/i.test(textToAnalyze)) {
        detectedType = 'recruitment';
        detectedTags.push('Tuyển dụng');
        isStrongMatch = true;
      } else if (/(thông báo|nghỉ lễ|khai giảng|lịch nghỉ|lịch thi|kết quả thi)/i.test(textToAnalyze)) {
        detectedType = 'news';
        detectedTags.push('Thông báo');
        isStrongMatch = true;
      } else if (/(sự kiện|cuộc thi|workshop|camp|trại hè)/i.test(textToAnalyze)) {
        detectedType = 'event';
        detectedTags.push('Sự kiện');
        isStrongMatch = true;
      }

      // Add common tags if keywords exist
      if (/(học bổng|scholarship)/i.test(textToAnalyze)) detectedTags.push('Học bổng');
      if (/(ielts)/i.test(textToAnalyze)) detectedTags.push('IELTS');
      if (/(toeic)/i.test(textToAnalyze)) detectedTags.push('TOEIC');
      if (/(giao tiếp)/i.test(textToAnalyze)) detectedTags.push('Giao tiếp');

      let finalType = detectedType || 'post';
      let finalTags = Array.from(new Set([...(post.tags || []), ...detectedTags]));

      // LỚP 2: AI FALLBACK (Nếu từ khóa không tìm thấy loại rõ ràng)
      if (!isStrongMatch) {
        console.log(`[AI] Gửi bài "${post.title}" lên AI vì không rõ ràng...`);
        const cleanContent = post.content.replace(/<[^>]*>?/gm, '');
        const aiResult = await classifyWithAI(post.title, cleanContent);
        
        if (aiResult) {
          finalType = aiResult.type || 'post';
          finalTags = Array.from(new Set([...(post.tags || []), ...(aiResult.tags || [])]));
          stats.byAI++;
          // Rate limiting delay (2.5 seconds)
          await sleep(2500); 
        } else {
          stats.byKeyword++;
        }
      } else {
        stats.byKeyword++;
      }

      // Cập nhật Database
      await prisma.post.update({
        where: { id: post.id },
        data: {
          type: finalType,
          tags: finalTags
        }
      });
      
      console.log(`✅ Đã phân loại: [${finalType}] - ${post.slug}`);
      
    } catch (err) {
      console.error(`❌ Lỗi phân loại bài ${post.slug}:`, err);
      stats.errors++;
    }
  }

  console.log('\n=======================================');
  console.log('🎉 ĐÃ HOÀN THÀNH PHÂN LOẠI HÀNG LOẠT!');
  console.log(`- Tổng số bài: ${stats.total}`);
  console.log(`- Xử lý tốc độ cao bằng Từ khóa: ${stats.byKeyword}`);
  console.log(`- Xử lý chuyên sâu bằng AI: ${stats.byAI}`);
  console.log(`- Lỗi: ${stats.errors}`);
  console.log('=======================================');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
