import { prisma } from "../src/lib/prisma";

const programsData = [
  {
    title: "Kinder",
    slug: "kinder",
    description: "Độ tuổi: 04 - 07 Tuổi",
    iconType: "lucide",
    iconValue: "Smile",
    order: 1,
    content: JSON.stringify({
      overview: [
        { label: "LỊCH HỌC", value: "02 buổi/tuần. (01 buổi học với GV Việt + 01 buổi kết hợp GV Việt & GV Bản địa)", icon: "Calendar" },
        { label: "ĐỐI TƯỢNG & NỘI DUNG", value: "Dành cho các bé mầm non đến lớp 1, lớp 2. Tiếp cận tiếng Anh qua các hoạt động vừa học vừa chơi (nhảy múa, vẽ tranh, bài hát, kể chuyện).", icon: "Target" },
        { label: "HỌC PHÍ", value: "7.860.000 VNĐ/ 6 tháng/ 24 tuần (Giáo trình 100k - 200k/bộ)", icon: "Wallet" },
        { label: "SĨ SỐ", value: "Nhóm 07 - 09 học viên", icon: "Users" }
      ],
      timeline: [
        { title: "PRE", subtitle: "Cơ bản", duration: "Khóa A & B (03 tháng/ khóa)" },
        { title: "MID", subtitle: "Trung cấp", duration: "Khóa A & B (03 tháng/ khóa)" },
        { title: "ADV", subtitle: "Nâng cao", duration: "Khóa A & B (03 tháng/ khóa)" },
        { title: "HON", subtitle: "Chuyên sâu", duration: "Khóa A & B (03 tháng/ khóa)" }
      ],
      note: "Học viên sẽ được kiểm tra trình độ đầu vào, định kỳ & cuối khóa để đánh giá năng lực."
    })
  },
  {
    title: "Starter",
    slug: "starter",
    description: "Độ tuổi: 07 - 10 Tuổi",
    iconType: "lucide",
    iconValue: "Rocket",
    order: 2,
    content: JSON.stringify({
      overview: [
        { label: "LỊCH HỌC", value: "02 buổi/tuần. (01 buổi học với GV Việt + 01 buổi kết hợp GV Việt & GV Bản địa)", icon: "Calendar" },
        { label: "ĐỐI TƯỢNG", value: "Phù hợp với học viên Tiểu học cần mở rộng vốn từ vựng, giao tiếp, nâng cao Nghe - Nói - Ngữ pháp hoặc thi KET, PET, IELTS.", icon: "Target" },
        { label: "HỌC PHÍ", value: "5.900.000 VNĐ/ 6 tháng/ 24 tuần (Giáo trình 270k - 330k/bộ)", icon: "Wallet" },
        { label: "SĨ SỐ", value: "Nhóm 12 - 15 học viên", icon: "Users" }
      ],
      timeline: [
        { title: "PRE", subtitle: "Cơ bản", duration: "Khóa A & B (03 tháng/ khóa)" },
        { title: "MID", subtitle: "Trung cấp", duration: "Khóa A & B (03 tháng/ khóa)" },
        { title: "ADV", subtitle: "Nâng cao", duration: "Khóa A & B (03 tháng/ khóa)" },
        { title: "HON", subtitle: "Chuyên sâu", duration: "Khóa A & B (03 tháng/ khóa)" }
      ],
      note: "Học viên sẽ được kiểm tra trình độ đầu vào, định kỳ & cuối khóa để đánh giá năng lực."
    })
  },
  {
    title: "Mover",
    slug: "mover",
    description: "Độ tuổi: Lớp 4 - Lớp 6",
    iconType: "lucide",
    iconValue: "Compass",
    order: 3,
    content: JSON.stringify({
      overview: [
        { label: "LỊCH HỌC", value: "02 buổi/tuần. (01 buổi học với GV Việt + 01 buổi kết hợp GV Bản địa)", icon: "Calendar" },
        { label: "ĐỐI TƯỢNG", value: "Học viên Tiểu học - đầu THCS rèn luyện đồng đều Nghe - Nói - Ngữ pháp, luyện thi KET, PET, IELTS...", icon: "Target" },
        { label: "HỌC PHÍ", value: "6.000.000 VNĐ/ 6 tháng/ 24 tuần (Giáo trình 340k - 530k/bộ)", icon: "Wallet" },
        { label: "SĨ SỐ", value: "Nhóm 12 - 15 học viên", icon: "Users" }
      ],
      timeline: [
        { title: "PRE", subtitle: "Cơ bản", duration: "Khóa A & B (03 tháng/ khóa)" },
        { title: "MID", subtitle: "Trung cấp", duration: "Khóa A & B (03 tháng/ khóa)" },
        { title: "ADV", subtitle: "Nâng cao", duration: "Khóa A & B (03 tháng/ khóa)" },
        { title: "HON", subtitle: "Chuyên sâu", duration: "Khóa A & B (03 tháng/ khóa)" }
      ],
      note: "Học viên sẽ được kiểm tra trình độ đầu vào, định kỳ & cuối khóa để đánh giá năng lực."
    })
  },
  {
    title: "Flyer",
    slug: "flyer",
    description: "Độ tuổi: Lớp 6 - Lớp 9",
    iconType: "lucide",
    iconValue: "PlaneTakeoff",
    order: 4,
    content: JSON.stringify({
      overview: [
        { label: "LỊCH HỌC", value: "03 buổi/tuần. (02 buổi học với GV Việt + 01 buổi học với GV Bản địa)", icon: "Calendar" },
        { label: "ĐỐI TƯỢNG", value: "Học viên THCS xây dựng nền tảng 4 kỹ năng Nghe-Nói-Đọc-Ngữ pháp, định hướng thi IELTS, TOEFL, SAT...", icon: "Target" },
        { label: "HỌC PHÍ", value: "7.800.000 VNĐ/ 6 tháng/ 24 tuần (Giáo trình từ 100k)", icon: "Wallet" }
      ],
      timeline: [
        { title: "PRE", subtitle: "Cơ bản", duration: "Khóa A & B (03 tháng/ khóa)" },
        { title: "MID", subtitle: "Trung cấp", duration: "Khóa A & B (03 tháng/ khóa)" },
        { title: "ADV", subtitle: "Nâng cao", duration: "Khóa A & B (03 tháng/ khóa)" },
        { title: "HON", subtitle: "Chuyên sâu", duration: "Khóa A & B (03 tháng/ khóa)" }
      ],
      note: "Học viên sẽ được kiểm tra trình độ đầu vào, định kỳ & cuối khóa để đánh giá năng lực."
    })
  },
  {
    title: "IELTS For Teens",
    slug: "ielts-for-teens",
    description: "Độ tuổi: Lớp 6 - Lớp 9",
    iconType: "lucide",
    iconValue: "GraduationCap",
    order: 5,
    content: JSON.stringify({
      overview: [
        { label: "LỊCH HỌC", value: "03 buổi/tuần.", icon: "Calendar" },
        { label: "MỤC TIÊU", value: "Đánh giá khả năng thành thạo tiếng Anh học thuật & xã hội, định hướng luyện thi IELTS", icon: "Target" },
        { label: "HỌC PHÍ", value: "8.100.000 - 11.900.000 VNĐ/ 6 tháng (Giáo trình từ 100k)", icon: "Wallet" }
      ],
      timeline: [
        { title: "PRE IE", subtitle: "Band 1.0 - 2.5", duration: "Khóa A & B (03 tháng/ 12 tuần)" },
        { title: "IET3.5", subtitle: "Band 2.5 - 3.5", duration: "Khóa A & B (03 tháng/ 12 tuần)" },
        { title: "IET4.5", subtitle: "Band 3.5 - 4.5", duration: "Khóa A & B (03 tháng/ 12 tuần)" },
        { title: "IET5.0", subtitle: "Band 4.5 - 5.0", duration: "Khóa A & B (03 tháng/ 12 tuần)" },
        { title: "IET5.5", subtitle: "Band 5.0 - 5.5", duration: "Khóa A & B (03 tháng/ 12 tuần)" },
        { title: "≥IET6.0", subtitle: "Luyện đề chuyên sâu", duration: "Khóa A & B (03 tháng/ 12 tuần)" }
      ],
      note: "Lộ trình linh hoạt tùy thuộc vào kết quả bài thi kiểm tra năng lực đầu vào của Học viên."
    })
  },
  {
    title: "Luyện Thi IELTS",
    slug: "ielts",
    description: "Độ tuổi: 15 Tuổi trở lên",
    iconType: "lucide",
    iconValue: "BookOpenCheck",
    order: 6,
    content: JSON.stringify({
      overview: [
        { label: "LỊCH HỌC", value: "Đa dạng các ca học phù hợp với sinh viên và người đi làm.", icon: "Calendar" },
        { label: "MỤC TIÊU", value: "Xây dựng vững chắc nền tảng 4 kỹ năng đến luyện thi IELTS giải đề chuyên sâu.", icon: "Target" }
      ],
      timeline: [
        { title: "IE D-CUB", subtitle: "Band 2.0 - 3.5", duration: "3 tháng/ 12 tuần", desc: "Dành cho học viên đã có nền tảng 4 kỹ năng bắt đầu học IELTS. (4.750.000đ/3th)" },
        { title: "IE D-GROW", subtitle: "Band 4.0 - 5.0", duration: "Khóa A & B", desc: "Ưu tiên dạy chuyên sâu về kỹ năng Viết. (10.100.000đ/6th)" },
        { title: "IE D-FLY", subtitle: "Band 5.0 - 5.5", duration: "Khóa A & B" },
        { title: "IE D-TRANSFORM", subtitle: "Band 5.5 - 6.0", duration: "Khóa A & B" },
        { title: "IE D-FIRE UP", subtitle: "Band 6.0 - 6.5", duration: "Khóa A & B", desc: "Nắm vững lý thuyết 4 kỹ năng và bắt đầu luyện giải đề. (Từ 10.700.000đ/6th)" },
        { title: "IE D-SOUR", subtitle: "Band 6.5 - 7.0", duration: "Khóa A & B" },
        { title: "IE D-PLUS", subtitle: "Band 7.0+", duration: "Khóa A & B" }
      ],
      note: "Học viên được làm Test đầu vào và điều chỉnh lộ trình học theo khả năng."
    })
  },
  {
    title: "Luyện Thi TOEIC",
    slug: "toeic",
    description: "Độ tuổi: 15 Tuổi trở lên",
    iconType: "lucide",
    iconValue: "FileBadge2",
    order: 7,
    content: JSON.stringify({
      overview: [
        { label: "MỤC TIÊU", value: "Luyện thi chứng chỉ TOEIC chuẩn quốc tế.", icon: "Target" }
      ],
      timeline: [
        { title: "TO.SF", subtitle: "GE - 350+", duration: "07 tháng/ 28 tuần/ 84 buổi", desc: "Khóa A: GE (Nghe, Nói, Ngữ pháp). Khóa B: Lý thuyết TOEIC & Giải đề half-test. Học phí: 7.930.000đ/7th." },
        { title: "TO.SJ", subtitle: "350 - 500+", duration: "Khóa A & B (06 tháng)", desc: "Luyện giải đề full-test. Học phí: 7.500.000đ/6th." },
        { title: "TO.SS", subtitle: "550 - 600+", duration: "Khóa A & B (06 tháng)", desc: "Đã nắm vững lý thuyết 4 kỹ năng và bắt đầu luyện giải đề. Học phí: Từ 7.700.000đ/6th." }
      ],
      note: "Chương trình học dựa trên trình độ thực tế sau khi kiểm tra đầu vào."
    })
  }
];

async function main() {
  console.log("Wiping existing SitePrograms...");
  await prisma.siteProgram.deleteMany({});
  
  console.log("Seeding real JSON-based programs...");
  for (const p of programsData) {
    await prisma.siteProgram.create({
      data: p
    });
    console.log("Created: " + p.title);
  }
  
  console.log("Seed completed!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
