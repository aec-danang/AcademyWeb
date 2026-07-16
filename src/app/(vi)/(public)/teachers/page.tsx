"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { User, Award, Star, Search, Filter, Mail, ArrowRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import styles from "./teachers.module.css";
import Link from "next/link";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

const experts = [
  {
    id: "t1",
    name: "Mr. David Smith",
    title: "Chuyên gia IELTS (Cựu Giám khảo)",
    category: "ielts",
    bio: "Hơn 15 năm kinh nghiệm giảng dạy và chấm thi IELTS tại Hội đồng Anh. Thầy David nổi tiếng với phương pháp tư duy Logic trong Writing Task 2 giúp học viên bứt phá điểm số.",
    stats: { exp: "15+ Năm", score: "IELTS 9.0", students: "5000+" },
    imageUrl: ""
  },
  {
    id: "t2",
    name: "Ms. Sarah Jane",
    title: "Chuyên gia Giao tiếp Tiếng Anh",
    category: "communication",
    bio: "Tốt nghiệp Thạc sĩ TESOL tại ĐH Cambridge. Cô Sarah chuyên huấn luyện kỹ năng phát âm chuẩn bản xứ và phản xạ giao tiếp nâng cao cho người đi làm.",
    stats: { exp: "10 Năm", score: "TESOL", students: "3000+" },
    imageUrl: ""
  },
  {
    id: "t3",
    name: "Mr. Thomas Edison",
    title: "Trưởng ban Chuyên môn Kids & Teens",
    category: "kids",
    bio: "Sở hữu phương pháp dạy học qua trò chơi (Gamification). Thầy Thomas giúp hàng ngàn học viên nhí yêu thích tiếng Anh một cách tự nhiên và hiệu quả.",
    stats: { exp: "8 Năm", score: "CELTA", students: "2500+" },
    imageUrl: ""
  },
  {
    id: "t4",
    name: "Ms. Anna Watson",
    title: "Chuyên gia Luyện thi TOEIC",
    category: "toeic",
    bio: "Cô Anna đã giúp hàng ngàn sinh viên đạt mốc TOEIC 800+ chỉ trong 3 tháng bằng các chiến thuật giải đề tối ưu và bí kíp nghe hiểu xuất sắc.",
    stats: { exp: "7 Năm", score: "TOEIC 990", students: "4000+" },
    imageUrl: ""
  },
  {
    id: "t5",
    name: "Mr. Robert Chen",
    title: "Giảng viên Tiếng Anh Doanh Nghiệp",
    category: "business",
    bio: "Chuyên gia đào tạo tiếng Anh thương mại cho các tập đoàn đa quốc gia. Phương pháp tập trung vào tình huống thực tế và thuyết trình thuyết phục.",
    stats: { exp: "12 Năm", score: "MBA", students: "1000+" },
    imageUrl: ""
  },
  {
    id: "t6",
    name: "Ms. Emily Rose",
    title: "Chuyên gia Kỹ năng Viết Học thuật",
    category: "ielts",
    bio: "Từng có nhiều bài báo công bố quốc tế. Cô Emily hướng dẫn học viên cách lập luận sắc bén và từ vựng học thuật đỉnh cao.",
    stats: { exp: "9 Năm", score: "IELTS 8.5", students: "2000+" },
    imageUrl: ""
  }
];

export default function TeachersPage() {
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useGSAP(() => {
    // Hero Animation
    gsap.fromTo(`.${styles.heroContent} > *`, 
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, stagger: 0.15, ease: "power3.out" }
    );

    // Filter Bar Animation
    gsap.fromTo(`.${styles.filterContainer}`,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, delay: 0.5, ease: "power3.out" }
    );

    // Cards Animation
    ScrollTrigger.batch(`.${styles.card}`, {
      onEnter: (batch) => gsap.fromTo(batch,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, stagger: 0.1, duration: 0.8, ease: "power3.out", overwrite: true }
      ),
      start: "top 90%"
    });

    // CTA Animation
    gsap.fromTo(`.${styles.ctaSection} .container > *`,
      { y: 40, opacity: 0 },
      {
        scrollTrigger: { trigger: `.${styles.ctaSection}`, start: "top 85%" },
        y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: "power3.out"
      }
    );
  }, { scope: containerRef });

  const filteredExperts = experts.filter(expert => {
    const matchesFilter = filter === "all" || expert.category === filter;
    const matchesSearch = expert.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          expert.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div ref={containerRef} style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroBackground}></div>
        <div className={`container ${styles.heroContent}`}>
          <div className={styles.heroBadge}>Our Faculty</div>
          <h1 className={styles.heroTitle}>Đội ngũ Chuyên gia tại AEC</h1>
          <p className={styles.heroSubtitle}>
            Gặp gỡ những giảng viên và chuyên gia giáo dục hàng đầu, những người sẽ đồng hành cùng bạn chinh phục mọi đỉnh cao ngôn ngữ.
          </p>
        </div>
      </section>

      {/* Filter Section */}
      <section className={styles.filterSection}>
        <div className={`container ${styles.filterContainer}`}>
          <div className={styles.searchBox}>
            <Search size={20} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Tìm kiếm giảng viên..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <div className={styles.filterOptions}>
            <button className={`${styles.filterBtn} ${filter === 'all' ? styles.activeFilter : ''}`} onClick={() => setFilter('all')}>Tất cả</button>
            <button className={`${styles.filterBtn} ${filter === 'ielts' ? styles.activeFilter : ''}`} onClick={() => setFilter('ielts')}>IELTS</button>
            <button className={`${styles.filterBtn} ${filter === 'communication' ? styles.activeFilter : ''}`} onClick={() => setFilter('communication')}>Giao tiếp</button>
            <button className={`${styles.filterBtn} ${filter === 'kids' ? styles.activeFilter : ''}`} onClick={() => setFilter('kids')}>Kids & Teens</button>
            <button className={`${styles.filterBtn} ${filter === 'toeic' ? styles.activeFilter : ''}`} onClick={() => setFilter('toeic')}>TOEIC</button>
          </div>
        </div>
      </section>

      {/* Grid Layout */}
      <section className={styles.expertsWrapper}>
        <div className="container">
          <div className={styles.expertsGrid}>
            {filteredExperts.length > 0 ? (
              filteredExperts.map((expert, index) => (
                <div key={expert.id} className={`${styles.card} ${mounted ? styles.cardVisible : ""}`}>
                  {/* Ảnh đại diện */}
                  <div className={styles.imageWrapper}>
                    {expert.imageUrl ? (
                      <Image src={expert.imageUrl} alt={expert.name} fill style={{ objectFit: 'cover' }} className={styles.expertImage} />
                    ) : (
                      <div className={styles.expertImagePlaceholder}>
                        <User size={80} strokeWidth={1.5} color="#94a3b8" />
                      </div>
                    )}
                    
                    <div className={styles.badgeContainer}>
                      <span className={styles.badge}><Star size={12} color="#fbbf24" style={{ display: "inline", verticalAlign: "middle", marginRight: "2px", marginBottom: "2px" }} /> Top Rated</span>
                    </div>

                    <div className={styles.imageOverlay}>
                      <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '14px' }}>Xem Hồ Sơ</button>
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
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.noResults}>
                <p>Không tìm thấy giảng viên phù hợp với tiêu chí tìm kiếm.</p>
                <button className="btn-secondary" onClick={() => { setFilter('all'); setSearchQuery(''); }} style={{ marginTop: '16px' }}>Xóa bộ lọc</button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className="container">
          <div className={styles.ctaCard}>
            <div className={styles.ctaContent}>
              <h2>Gia nhập đội ngũ AEC?</h2>
              <p>Chúng tôi luôn chào đón những giáo viên tài năng, tâm huyết và chung chí hướng phát triển giáo dục cộng đồng.</p>
              <Link href="/contact" className={`btn-primary ${styles.ctaButton}`}>
                <Mail size={18} style={{ marginRight: '8px' }} /> Ứng tuyển ngay
              </Link>
            </div>
            <div className={styles.ctaImage}>
              <div className={styles.patternIcon}>
                <Award size={120} color="var(--color-orange)" opacity={0.2} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
