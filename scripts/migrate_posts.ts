import 'dotenv/config';
import mysql from 'mysql2/promise';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function run() {
  console.log("🚀 Bắt đầu quá trình Migrate Blog và Trang (Posts & Pages)");

  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'academy_old',
  });

  console.log("\n--- Tiến hành đẩy bài viết Blog ---");
  const [posts] = await connection.execute<mysql.RowDataPacket[]>(
    "SELECT * FROM wpuw_posts WHERE post_type IN ('post', 'page') AND post_status = 'publish'"
  );
  console.log(`Đã tìm thấy ${posts.length} bài viết/trang.`);

  let postCount = 0;
  for (const post of posts) {
    if (!post.post_title) continue;

    try {
      // Clean up Elementor shortcodes
      let cleanContent = (post.post_content || '').replace(/\[.*?\]/g, '');
      
      let slug = post.post_name;
      if (!slug) {
        slug = "post-" + post.ID;
      }
      
      // Since slugs must be unique, append ID to guarantee uniqueness
      slug = slug + "-" + post.ID;

      await prisma.post.upsert({
        where: { slug: slug },
        update: {
          title: post.post_title,
          content: cleanContent,
        },
        create: {
          title: post.post_title,
          content: cleanContent,
          slug: slug,
          type: post.post_type, // 'post' or 'page'
          published: true,
          createdAt: new Date(post.post_date),
          updatedAt: new Date(post.post_modified)
        }
      });
      postCount++;
    } catch (e: any) {
      console.log(`Lỗi khi nạp post ${post.post_title}:`, e.message);
    }
  }

  console.log(`✅ Thành công! Đã đẩy ${postCount} bài viết/trang lên Railway.`);

  await connection.end();
}

run().catch(console.error).finally(() => prisma.$disconnect());
