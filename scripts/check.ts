import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function check() {
  const users = await prisma.user.findMany();
  const posts = await prisma.post.findMany();
  
  let report = "=== BÁO CÁO DỮ LIỆU ĐANG CÓ THỰC TẾ TRÊN RAILWAY ===\n";
  report += "Lưu ý: Dữ liệu này được lấy trực tiếp từ máy chủ thomas.proxy.rlwy.net của Railway!\n\n";
  
  report += `1. SỐ TÀI KHOẢN (USER): ${users.length}\n`;
  users.forEach(u => report += ` - ${u.name} (${u.email})\n`);
  
  report += `\n2. SỐ BÀI VIẾT/TRANG (POST/PAGE): ${posts.length}\n`;
  for(let i=0; i<Math.min(5, posts.length); i++) {
    report += ` - ${posts[i].title}\n`;
  }
  report += ` ... (và ${posts.length - 5} bài khác)\n`;

  fs.writeFileSync('e:/AEC/AcademyWeb/BAO_CAO_RAILWAY.txt', report);
  console.log("Đã tạo file báo cáo");
}

check().catch(console.error).finally(() => prisma.$disconnect());
