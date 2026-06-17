"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { User, Award, Star, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./teachers.module.css";

const experts = [
  {
    id: "t1",
    name: "Mr. David Smith",
    title: "Chuyên gia IELTS (Cựu Giám khảo)",
    bio: "Hơn 15 năm kinh nghiệm giảng dạy và chấm thi IELTS tại Hội đồng Anh. Thầy David nổi tiếng với phương pháp tư duy Logic trong Writing Task 2 giúp học viên bứt phá điểm số.",
    stats: { exp: "15+ Năm", score: "IELTS 9.0", students: "5000+" }
  },
  {
    id: "t2",
    name: "Ms. Sarah Jane",
    title: "Chuyên gia Giao tiếp Tiếng Anh",
    bio: "Tốt nghiệp Thạc sĩ TESOL tại ĐH Cambridge. Cô Sarah chuyên huấn luyện kỹ năng phát âm chuẩn bản xứ và phản xạ giao tiếp nâng cao cho người đi làm.",
    stats: { exp: "10 Năm", score: "TESOL", students: "3000+" }
  },
  {
    id: "t3",
    name: "Mr. Thomas Edison",
    title: "Trưởng ban Chuyên môn Kids & Teens",
    bio: "Sở hữu phương pháp dạy học qua trò chơi (Gamification). Thầy Thomas giúp hàng ngàn học viên nhí yêu thích tiếng Anh một cách tự nhiên và hiệu quả.",
    stats: { exp: "8 Năm", score: "CELTA", students: "2500+" }
  },
  {
    id: "t4",
    name: "Ms. Anna Watson",
    title: "Chuyên gia Luyện thi TOEIC",
    bio: "Cô Anna đã giúp hàng ngàn sinh viên đạt mốc TOEIC 800+ chỉ trong 3 tháng bằng các chiến thuật giải đề tối ưu và bí kíp nghe hiểu xuất sắc.",
    stats: { exp: "7 Năm", score: "TOEIC 990", students: "4000+" }
  },
  {
    id: "t5",
    name: "Mr. Robert Chen",
    title: "Giảng viên Tiếng Anh Doanh Nghiệp",
    bio: "Chuyên gia đào tạo tiếng Anh thương mại cho các tập đoàn đa quốc gia. Phương pháp tập trung vào tình huống thực tế và thuyết trình thuyết phục.",
    stats: { exp: "12 Năm", score: "MBA", students: "1000+" }
  },
  {
    id: "t6",
    name: "Ms. Emily Rose",
    title: "Chuyên gia Kỹ năng Viết Học thuật",
    bio: "Từng có nhiều bài báo công bố quốc tế. Cô Emily hướng dẫn học viên cách lập luận sắc bén và từ vựng học thuật đỉnh cao.",
    stats: { exp: "9 Năm", score: "IELTS 8.5", students: "2000+" }
  }
];

export default function TeachersPage() {
  const [mounted, setMounted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 350; // Approximate width of a card + gap
      const currentScroll = scrollRef.current.scrollLeft;
      scrollRef.current.scrollTo({
        left: direction === "left" ? currentScroll - scrollAmount : currentScroll + scrollAmount,
        behavior: "smooth"
      });
    }
  };

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Đội ngũ Chuyên gia tại AEC</h1>
          <p className={styles.heroSubtitle}>
            Gặp gỡ những giảng viên và chuyên gia giáo dục hàng đầu, những người sẽ đồng hành cùng bạn chinh phục mọi đỉnh cao ngôn ngữ.
          </p>
        </div>
      </section>

      {/* Slider Layout */}
      <section className={styles.sliderWrapper}>
        <button 
          className={`${styles.scrollBtn} ${styles.scrollBtnLeft}`}
          onClick={() => scroll("left")}
          aria-label="Scroll left"
        >
          <ChevronLeft size={24} />
        </button>
        
        <div className={styles.expertsGrid} ref={scrollRef}>
          {experts.map((expert, index) => (
            <div 
              key={expert.id} 
              className={`${styles.card} ${mounted ? styles.cardVisible : ""}`}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Ảnh đại diện */}
              <div className={styles.imageWrapper}>
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 0, color: "#cbd5e1" }}>
                  <User size={120} strokeWidth={1} />
                </div>
                {/* Image component sẽ được dùng khi có ảnh thật. Tạm thời là một div màu nhạt */}
                <div className={styles.expertImage} style={{ background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.05))" }}></div>
                
                <div className={styles.badgeContainer}>
                  <span className={styles.badge}><Star size={12} color="#fbbf24" style={{ display: "inline", verticalAlign: "middle", marginRight: "2px", marginBottom: "2px" }} /> Top Rated</span>
                </div>
              </div>

              {/* Thông tin Chi tiết */}
              <div className={styles.content}>
                <h2 className={styles.name}>{expert.name}</h2>
                <div className={styles.title}>{expert.title}</div>
                <p className={styles.bio}>{expert.bio}</p>
                
                <div className={styles.stats}>
                  <div className={styles.statItem}>
                    <span className={styles.statValue}>{expert.stats.exp}</span>
                    <span className={styles.statLabel}>Kinh nghiệm</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statValue}>{expert.stats.score}</span>
                    <span className={styles.statLabel}>Chứng chỉ</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statValue}>{expert.stats.students}</span>
                    <span className={styles.statLabel}>Học viên</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button 
          className={`${styles.scrollBtn} ${styles.scrollBtnRight}`}
          onClick={() => scroll("right")}
          aria-label="Scroll right"
        >
          <ChevronRight size={24} />
        </button>
      </section>
    </div>
  );
}
