import 'dotenv/config';
import mysql from 'mysql2/promise';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function run() {
  console.log("🚀 Bắt đầu quá trình Push lại dữ liệu lên Railway");

  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'academy_old',
  });

  console.log("\n--- Tiến hành đẩy dữ liệu Học viên (Users) ---");
  const [users] = await connection.execute<mysql.RowDataPacket[]>('SELECT * FROM wpuw_users');
  console.log(`Đã tìm thấy ${users.length} tài khoản trong Database cũ.`);

  let userCount = 0;
  for (const user of users) {
    if (!user.user_email || !user.user_email.includes('@')) continue;
    try {
      await prisma.user.upsert({
        where: { email: user.user_email },
        update: {
          name: user.display_name || user.user_login,
        },
        create: {
          name: user.display_name || user.user_login,
          email: user.user_email,
          createdAt: new Date(user.user_registered),
        }
      });
      userCount++;
    } catch (e: any) {
      console.log(`Lỗi khi nạp user ${user.user_email}:`, e.message);
    }
  }
  console.log(`✅ Thành công! Đã PUSH ${userCount} học viên lên Railway.`);

  await connection.end();
}

run().catch(console.error).finally(() => prisma.$disconnect());
