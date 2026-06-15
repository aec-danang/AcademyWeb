import 'dotenv/config';
import mysql from 'mysql2/promise';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function run() {
  console.log("🚀 Bắt đầu SIÊU TIẾN TRÌNH MIGRATE TOÀN TẬP TỪ XAMPP -> RAILWAY");

  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'academy_old', // Đảm bảo lấy từ DB mới nhất đã import Full
  });

  // ---------------------------------------------------------
  // 1. QUIZ MASTER (TESTS)
  // ---------------------------------------------------------
  console.log("\n--- Tiến hành đẩy dữ liệu Quiz Master (Tests) ---");
  try {
    const [quizzes] = await connection.execute<mysql.RowDataPacket[]>('SELECT * FROM wpuw_mlw_quizzes');
    console.log(`Đã tìm thấy ${quizzes.length} bài thi.`);

    for (const quiz of quizzes) {
      try {
        await prisma.test.upsert({
          where: { id: quiz.quiz_id.toString() },
          update: {},
          create: {
            id: quiz.quiz_id.toString(),
            title: quiz.quiz_name,
            timeLimit: quiz.time_limit ? parseInt(quiz.time_limit) : null,
            createdAt: quiz.date_created ? new Date(quiz.date_created) : new Date(),
          }
        });
      } catch (e: any) {
        console.log(`Lỗi khi nạp Test ID ${quiz.quiz_id}:`, e.message);
      }
    }
  } catch(e) { console.log("Không tìm thấy bảng wpuw_mlw_quizzes"); }

  // 1.1 QUESTIONS
  console.log("\n--- Tiến hành đẩy dữ liệu Câu hỏi (Questions) ---");
  try {
    const [questions] = await connection.execute<mysql.RowDataPacket[]>('SELECT * FROM wpuw_mlw_questions');
    console.log(`Đã tìm thấy ${questions.length} câu hỏi.`);

    for (const q of questions) {
      try {
        await prisma.testQuestion.upsert({
          where: { id: q.question_id.toString() },
          update: {},
          create: {
            id: q.question_id.toString(),
            testId: q.quiz_id.toString(),
            question: q.question_name || "Empty Question",
            options: q.question_answers || "[]",
            answer: q.correct_answer || "",
          }
        });
      } catch (e: any) {}
    }
  } catch(e) { console.log("Không tìm thấy bảng wpuw_mlw_questions"); }

  // 1.2 RESULTS
  console.log("\n--- Tiến hành đẩy dữ liệu Kết quả thi (Results) ---");
  try {
    const [results] = await connection.execute<mysql.RowDataPacket[]>('SELECT * FROM wpuw_mlw_results');
    console.log(`Đã tìm thấy ${results.length} kết quả làm bài.`);

    for (const r of results) {
      try {
        await prisma.testResult.upsert({
          where: { id: r.result_id.toString() },
          update: {},
          create: {
            id: r.result_id.toString(),
            testId: r.quiz_id.toString(),
            score: r.point_score ? parseFloat(r.point_score) : 0,
          }
        });
      } catch (e: any) {}
    }
  } catch(e) { console.log("Không tìm thấy bảng wpuw_mlw_results"); }

  // ---------------------------------------------------------
  // 2. LEADS (WPFORMS)
  // ---------------------------------------------------------
  console.log("\n--- Tiến hành đẩy dữ liệu WPForms (Leads) ---");
  try {
    const [leads] = await connection.execute<mysql.RowDataPacket[]>('SELECT * FROM wpuw_wpforms_entries');
    console.log(`Đã tìm thấy ${leads.length} lượt điền Form.`);
    
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
      } catch(e:any){}
    }
  } catch(e) { console.log("Không tìm thấy bảng wpuw_wpforms_entries"); }

  // ---------------------------------------------------------
  // 3. VÒNG QUAY MAY MẮN
  // ---------------------------------------------------------
  console.log("\n--- Tiến hành đẩy dữ liệu Vòng quay (Leads) ---");
  try {
    const [wofs] = await connection.execute<mysql.RowDataPacket[]>('SELECT * FROM wpuw_wof_lite_optins');
    console.log(`Đã tìm thấy ${wofs.length} lượt quay.`);
    let wofCount = 0;
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
        wofCount++;
      } catch(e:any){}
    }
  } catch(e) { console.log("Không tìm thấy bảng vòng quay"); }

  // ---------------------------------------------------------
  // 4. ĐƠN HÀNG WOOCOMMERCE
  // ---------------------------------------------------------
  console.log("\n--- Tiến hành đẩy dữ liệu Đơn hàng WooCommerce ---");
  try {
    const [orders] = await connection.execute<mysql.RowDataPacket[]>('SELECT * FROM wpuw_woocommerce_order_items');
    console.log(`Đã tìm thấy ${orders.length} mặt hàng đã bán.`);
    for (const o of orders) {
      try {
        await prisma.order.upsert({
          where: { id: o.order_item_id.toString() },
          update: {},
          create: {
            id: o.order_item_id.toString(),
            totalAmount: 0,
            status: "completed",
          }
        });
      } catch(e:any){}
    }
  } catch(e) { console.log("Không tìm thấy bảng Đơn hàng"); }

  console.log("\n🎉 HOÀN TẤT DI CHUYỂN TOÀN BỘ DỮ LIỆU CŨ LÊN RAILWAY!");

  await connection.end();
}

run().catch(console.error).finally(() => prisma.$disconnect());
