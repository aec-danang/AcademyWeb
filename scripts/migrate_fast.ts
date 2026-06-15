import 'dotenv/config';
import mysql from 'mysql2/promise';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function run() {
  console.log("🚀 CHẠY NHANH: ĐẨY LEADS VÀ USERS TRƯỚC");

  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'academy_old',
  });

  // 1. PUSH USERS LẠI
  console.log("\n--- Đẩy Học viên (Users) ---");
  try {
    const [users] = await connection.execute<mysql.RowDataPacket[]>('SELECT * FROM wpuw_users');
    let uCount = 0;
    for (const user of users) {
      if (!user.user_email || !user.user_email.includes('@')) continue;
      try {
        await prisma.user.upsert({
          where: { email: user.user_email },
          update: { name: user.display_name },
          create: {
            name: user.display_name,
            email: user.user_email,
            createdAt: new Date(user.user_registered),
          }
        });
        uCount++;
      } catch(e){}
    }
    console.log(`✅ Đã đẩy ${uCount} Users.`);
  } catch(e){}

  // 2. PUSH LEADS (WPFORMS)
  console.log("\n--- Đẩy Khách hàng WPForms (Leads) ---");
  try {
    const [leads] = await connection.execute<mysql.RowDataPacket[]>('SELECT * FROM wpuw_wpforms_entries');
    let lCount = 0;
    for (const l of leads) {
      try {
        let name = "Khách hàng " + l.entry_id;
        let email = "";
        if (l.fields) {
          try {
            const fields = JSON.parse(l.fields);
            for (let key in fields) {
               if (fields[key].type === 'name' || fields[key].name === 'Họ và Tên') name = fields[key].value;
               if (fields[key].type === 'email' || fields[key].name === 'Email') email = fields[key].value;
            }
          } catch(err){}
        }

        await prisma.lead.upsert({
          where: { id: l.entry_id.toString() },
          update: {},
          create: {
            id: l.entry_id.toString(),
            name: name,
            email: email,
            source: "wpforms",
            createdAt: new Date(l.date)
          }
        });
        lCount++;
      } catch(e:any){}
    }
    console.log(`✅ Đã đẩy ${lCount} Khách hàng từ WPForms.`);
  } catch(e) {}

  // 3. PUSH LEADS (VÒNG QUAY)
  console.log("\n--- Đẩy Khách hàng Vòng Quay ---");
  try {
    const [wofs] = await connection.execute<mysql.RowDataPacket[]>('SELECT * FROM wpuw_wof_lite_optins');
    let wCount = 0;
    for (const w of wofs) {
      try {
        await prisma.lead.create({
          data: {
            name: w.name || "Khách quay vòng quay",
            email: w.email || null,
            source: "vong_quay",
            createdAt: new Date(w.date)
          }
        });
        wCount++;
      } catch(e:any){}
    }
    console.log(`✅ Đã đẩy ${wCount} Khách hàng từ Vòng Quay.`);
  } catch(e) {}

  await connection.end();
  console.log("HOÀN TẤT CHẠY NHANH!");
}

run().catch(console.error).finally(() => prisma.$disconnect());
