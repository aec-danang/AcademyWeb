"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import * as LucideIcons from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import styles from "./page.module.css";
import Card from "@/lib/ui/Card";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

const HARDCODED_PROGRAMS = [
  { slug: "kids", title: "Kids", description: "Tiếng Anh mầm non và thiếu nhi.", icon: "Baby" },
  { slug: "teens", title: "Teens", description: "Tiếng Anh thiếu niên, phát triển toàn diện.", icon: "UserCircle" },
  { slug: "ielts", title: "IELTS", description: "Luyện thi IELTS chuẩn quốc tế.", icon: "Award" },
  { slug: "toeic-toefl", title: "TOEIC / TOEFL", description: "Chứng chỉ tiếng Anh học thuật & công việc.", icon: "FileText" },
  { slug: "communication", title: "Communication", description: "Tiếng Anh giao tiếp ứng dụng.", icon: "MessageCircle" },
  { slug: "business-english", title: "Business English", description: "Tiếng Anh doanh nghiệp chuyên sâu.", icon: "Briefcase" },
];

const WHY_ACADEMY_POINTS = [
  { title: "Hơn 25 năm kinh nghiệm", desc: "Thành lập từ 2001, tự hào là đơn vị tiên phong đào tạo Anh ngữ.", icon: "Clock" },
  { title: "Giáo viên giàu kinh nghiệm", desc: "Đội ngũ giáo viên bản ngữ và Việt Nam chuyên môn cao.", icon: "Users" },
  { title: "Lộ trình học rõ ràng", desc: "Cá nhân hóa theo từng độ tuổi và năng lực của học viên.", icon: "Map" },
  { title: "Đánh giá năng lực định kỳ", desc: "Hệ thống bài kiểm tra theo dõi sự tiến bộ liên tục.", icon: "BarChart" },
  { title: "Hoạt động ngoại khóa", desc: "Môi trường thực hành tiếng Anh qua các sự kiện, câu lạc bộ.", icon: "Tent" },
  { title: "Hệ thống học tập hiện đại", desc: "Ứng dụng công nghệ giáo dục tiên tiến nhất.", icon: "Laptop" },
];

const LEARNING_SUPPORT = [
  { title: "Placement Test", desc: "Đánh giá năng lực đầu vào chuẩn xác.", icon: "PenTool" },
  { title: "Progress Test", desc: "Bài kiểm tra định kỳ theo dõi quá trình học.", icon: "TrendingUp" },
  { title: "Teacher Feedback", desc: "Nhận xét 1-1 từ giáo viên sau mỗi khóa.", icon: "MessageSquare" },
  { title: "Parent Communication", desc: "Cập nhật liên tục tình hình học tập cho phụ huynh.", icon: "Smartphone" },
  { title: "Learning Materials", desc: "Tài liệu học tập phong phú, chuẩn quốc tế.", icon: "BookOpen" },
  { title: "Academic Support", desc: "Đội ngũ trợ giảng hỗ trợ ngoài giờ lên lớp.", icon: "LifeBuoy" },
];

export default function LandingClient({ 
  programs,
  features,
  settings,
  events,
  news,
  posts,
  testimonials,
  studentLifeEvents = []
}: { 
  programs: any[];
  features: any[];
  settings: Record<string, string>;
  events: any[];
  news: any[];
  posts: any[];
  testimonials: any[];
  studentLifeEvents?: any[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeNewsTab, setActiveNewsTab] = useState<'news' | 'events' | 'posts'>('news');

  useGSAP(() => {
    // 1. Hero Section Animation
    const heroTl = gsap.timeline();
    heroTl.from(`.${styles.heroContent} > *`, {
      y: 40,
      opacity: 0,
      duration: 1.2,
      stagger: 0.15,
      ease: "power4.out",
      delay: 0.1
    });

    // 2. Stats Section Counter
    const statElements = gsap.utils.toArray<HTMLElement>(`.${styles.statNumber}`);
    statElements.forEach((el) => {
      const text = el.innerText;
      const numMatch = text.match(/[\d,]+/);
      if (!numMatch) return;
      
      const targetNum = parseInt(numMatch[0].replace(/,/g, ''), 10);
      const prefix = text.substring(0, text.indexOf(numMatch[0]));
      const suffix = text.substring(text.indexOf(numMatch[0]) + numMatch[0].length);
      
      const counter = { val: 0 };
      
      gsap.to(counter, {
        val: targetNum,
        duration: 2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: `.${styles.statsSection}`,
          start: "top 90%",
        },
        onUpdate: () => {
          el.innerText = prefix + Math.floor(counter.val).toLocaleString() + suffix;
        }
      });
    });

    gsap.from(`.${styles.statsGrid}`, {
      scrollTrigger: { trigger: `.${styles.statsSection}`, start: "top 90%" },
      y: 40,
      opacity: 0,
      duration: 1,
      ease: "power4.out"
    });

    // Generic section header and grid animations
    const sections = [
      `.${styles.journeySection}`, 
      `.${styles.programs}`, 
      `.${styles.bentoSection}`, 
      `.${styles.supportSection}`, 
      `.${styles.studentLifeSection}`, 
      `.${styles.newsSection}`,
      `.${styles.testimonialsSection}`
    ];
    
    sections.forEach(section => {
      gsap.fromTo(`${section} .${styles.sectionHeader}`, 
        { opacity: 0, y: 30 },
        {
          scrollTrigger: { trigger: section, start: "top 85%" },
          opacity: 1, y: 0, duration: 0.8
        }
      );
      
      const gridItems = gsap.utils.toArray(`${section} [class*="Card"], ${section} [class*="Item"], ${section} [class*="gallery"]`);
      if (gridItems.length > 0) {
        gsap.fromTo(gridItems,
          { opacity: 0, y: 40 },
          {
            scrollTrigger: { trigger: section, start: "top 80%" },
            opacity: 1, y: 0, stagger: 0.1, duration: 0.8, ease: "power4.out"
          }
        );
      }
    });

    // CTA
    gsap.fromTo(`.${styles.ctaSection} .container > *`, 
      { y: 40, opacity: 0 },
      {
        scrollTrigger: { trigger: `.${styles.ctaSection}`, start: "top 85%" },
        y: 0, opacity: 1, duration: 1, stagger: 0.15, ease: "power4.out"
      }
    );

  }, { scope: containerRef, dependencies: [activeNewsTab] });

  // Get active items based on tab
  const activeItems = activeNewsTab === 'news' ? news : activeNewsTab === 'events' ? events : posts;

  return (
    <div ref={containerRef}>
      {/* 1. Hero Section */}
      <section className={styles.hero}>
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: -1 }}>
          <Image src="/images/hero_demo.png" alt="Academy Hero" fill style={{ objectFit: 'cover' }} priority />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(240, 240, 248, 0.95) 0%, rgba(240, 240, 248, 0.6) 100%)" }}></div>
        </div>
        <div className={`container ${styles.heroContainer}`}>
          <div className={styles.heroContent}>
            <h1>
              <span className={styles.heroHighlight}>Academy</span><br />
              Hơn 25 Năm Đồng Hành<br />
              Cùng <span className={styles.heroHighlight}>Giáo Dục Ngoại Ngữ</span>
            </h1>
            <p style={{ color: "var(--color-navy)", fontWeight: 500, fontSize: "1.15rem", marginBottom: "40px", opacity: 0.85 }}>Từ tiền thân Hồng Đức năm 2001, thương hiệu Academy English Center từ 2006. Tự hào mang đến nền tảng ngôn ngữ vững chắc cho các thế hệ học viên.</p>
            <div className={styles.heroButtons}>
              <Link href="/contact#register" className="btn-primary" style={{ boxShadow: "0 8px 20px rgba(239, 106, 55, 0.3)" }}>Đăng ký học thử</Link>
              <Link href="/contact#test" className="btn-secondary" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: "blur(10px)", border: "1px solid rgba(255, 255, 255, 0.5)" }}>Kiểm tra trình độ</Link>
            </div>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.visualShape1}></div>
            <div className={styles.visualShape2}></div>
            <div className={styles.visualShape3}></div>
            
            <div className={`${styles.glassCard} ${styles.glassCard1}`}>
              <div className={styles.glassCardIcon}>
                <LucideIcons.Trophy size={24} />
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#5f607a', fontWeight: 'normal' }}>Founded in</div>
                <div style={{ fontWeight: 700, color: "var(--color-navy)" }}>2006</div>
              </div>
            </div>
            
            <div className={`${styles.glassCard} ${styles.glassCard2}`}>
              <div className={styles.glassCardIcon}>
                <LucideIcons.Star size={24} />
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#5f607a', fontWeight: 'normal' }}>Top Rated</div>
                <div style={{ fontWeight: 700, color: "var(--color-navy)" }}>English Center</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Trust & Statistics Section */}
      <section className={styles.statsSection}>
        <div className="container">
          <div className={styles.statsGrid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>25+</div>
              <div className={styles.statLabel}>Years of Experience</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>800+</div>
              <div className={styles.statLabel}>Learners Every Month</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>6+</div>
              <div className={styles.statLabel}>Chương trình từ Thiếu nhi đến Doanh nghiệp</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>10+</div>
              <div className={styles.statLabel}>Đối tác đào tạo trường học & doanh nghiệp</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Our Journey */}
      <section className={styles.journeySection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2>Our Journey</h2>
            <p>25 Years of Educational Excellence</p>
          </div>
          <div className={styles.timeline}>
            <div className={styles.timelineItem}>
              <div className={styles.timelineYear}>2001</div>
              <div className={styles.timelineDesc}>Tiền thân Hồng Đức</div>
            </div>
            <div className={styles.timelineItem}>
              <div className={styles.timelineYear}>2006</div>
              <div className={styles.timelineDesc}>Thương hiệu Academy English Center</div>
            </div>
            <div className={styles.timelineItem}>
              <div className={styles.timelineYear}>Today</div>
              <div className={styles.timelineDesc}>Hệ thống đào tạo chuẩn quốc tế</div>
            </div>
          </div>
          <div style={{ textAlign: "center", marginTop: "40px" }}>
            <Link href="/about" className="btn-secondary">Xem hành trình</Link>
          </div>
        </div>
      </section>

      {/* 4. Programs Section */}
      <section className={styles.programs} id="programs">
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2>Chương Trình Đào Tạo</h2>
            <p>Lộ trình học tập toàn diện cho mọi độ tuổi và mục tiêu.</p>
          </div>
          <div className={styles.programsGrid}>
            {HARDCODED_PROGRAMS.map((program) => {
              // @ts-ignore
              const LucideIcon = LucideIcons[program.icon];
              const IconComponent = LucideIcon ? <LucideIcon size={48} strokeWidth={1.5} /> : <LucideIcons.FileQuestion size={48} strokeWidth={1.5} />;

              return (
                <Link key={program.slug} href={`/programs/${program.slug}`} style={{ display: "block", textDecoration: "none" }}>
                  <Card className={styles.programCard}>
                    <div className={styles.programIcon}>{IconComponent}</div>
                    <h3>{program.title}</h3>
                    <p style={{ marginTop: "12px", color: "#5f607a" }}>{program.description}</p>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Why Academy Section */}
      <section className={styles.bentoSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2>Vì sao chọn Academy?</h2>
            <p>Cam kết chất lượng giáo dục hàng đầu.</p>
          </div>
          <div className={styles.whyGrid}>
            {WHY_ACADEMY_POINTS.map((point, i) => {
              // @ts-ignore
              const Icon = LucideIcons[point.icon];
              return (
                <div key={i} className={styles.whyCard}>
                  <div className={styles.whyIcon}>
                    {Icon && <Icon size={32} />}
                  </div>
                  <h3>{point.title}</h3>
                  <p>{point.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. Learning Support */}
      <section className={styles.supportSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2>Hệ Thống Hỗ Trợ Học Tập</h2>
            <p>Đồng hành cùng học viên trên mỗi bước đường.</p>
          </div>
          <div className={styles.supportGrid}>
            {LEARNING_SUPPORT.map((support, i) => {
              // @ts-ignore
              const Icon = LucideIcons[support.icon];
              return (
                <div key={i} className={styles.supportCard}>
                  <div className={styles.supportIcon}>
                    {Icon && <Icon size={28} />}
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.1rem", margin: "0 0 8px 0", color: "var(--color-navy)" }}>{support.title}</h3>
                    <p style={{ color: "var(--text-muted)", margin: 0 }}>{support.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. Student Life */}
      <section className={styles.studentLifeSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2>Student Life</h2>
            <p>Môi trường học tập năng động và sáng tạo.</p>
          </div>
          <div className={styles.studentLifeGrid}>
            {studentLifeEvents.length > 0 ? (
              studentLifeEvents.map((event, index) => {
                let extraClass = "";
                if (index === 0) extraClass = styles.galleryItem1;
                else if (index === 1) extraClass = styles.galleryItem2;
                else if (index === 2) extraClass = styles.galleryItem3;

                return (
                  <div key={event.id} className={`${styles.galleryCard} ${extraClass}`}>
                    <img src={event.imageUrl} alt={event.title} className={styles.imagePlaceholder} style={{ objectFit: 'cover', width: '100%', height: '100%', padding: 0, backgroundColor: 'transparent' }} />
                    <div className={styles.galleryLabel}>{event.title}</div>
                  </div>
                );
              })
            ) : (
              // Fallback default grid if empty
              <>
                <div className={`${styles.galleryCard} ${styles.galleryItem1}`}>
                  <div className={styles.imagePlaceholder}>[ Summer Camp Image ]</div>
                  <div className={styles.galleryLabel}>Summer Camp</div>
                </div>
                <div className={`${styles.galleryCard} ${styles.galleryItem2}`}>
                  <div className={styles.imagePlaceholder}>[ Speaking Club Image ]</div>
                  <div className={styles.galleryLabel}>Speaking Club</div>
                </div>
                <div className={`${styles.galleryCard} ${styles.galleryItem3}`}>
                  <div className={styles.imagePlaceholder}>[ Graduation Image ]</div>
                  <div className={styles.galleryLabel}>Graduation</div>
                </div>
                <div className={styles.galleryCard}>
                  <div className={styles.imagePlaceholder}>[ Events Image ]</div>
                  <div className={styles.galleryLabel}>Events</div>
                </div>
                <div className={styles.galleryCard}>
                  <div className={styles.imagePlaceholder}>[ Workshop Image ]</div>
                  <div className={styles.galleryLabel}>Workshop</div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 9. News & Resources */}
      <section className={styles.newsSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2>Cập Nhật Từ Academy</h2>
            <p>Tin tức, sự kiện và tài liệu hữu ích.</p>
          </div>
          <div className={styles.newsTabsContainer}>
            <div className={styles.newsTabHeader}>
              <button 
                className={`${styles.newsTabBtn} ${activeNewsTab === 'news' ? styles.active : ''}`}
                onClick={() => setActiveNewsTab('news')}
              >Tin tức</button>
              <button 
                className={`${styles.newsTabBtn} ${activeNewsTab === 'events' ? styles.active : ''}`}
                onClick={() => setActiveNewsTab('events')}
              >Sự kiện</button>
              <button 
                className={`${styles.newsTabBtn} ${activeNewsTab === 'posts' ? styles.active : ''}`}
                onClick={() => setActiveNewsTab('posts')}
              >Học liệu & Mẹo</button>
            </div>
            
            <div className={styles.newsGrid}>
              {activeItems.length > 0 ? (
                activeItems.slice(0, 3).map((item) => (
                  <Link key={item.slug} href={`/${activeNewsTab}/${item.slug}`} className={styles.newsCard}>
                    {item.featuredImage ? (
                      <div className={styles.newsImageWrapper}>
                        <Image src={item.featuredImage} alt={item.title} fill style={{ objectFit: 'cover' }} />
                      </div>
                    ) : (
                      <div className={styles.newsImageWrapper}>
                        <div className={styles.imagePlaceholder}>[ {item.title} ]</div>
                      </div>
                    )}
                    <div className={styles.newsContent}>
                      <span className={styles.newsDate} suppressHydrationWarning>
                        {new Date(item.createdAt).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <h3>{item.title}</h3>
                      {item.excerpt && <p>{item.excerpt}</p>}
                    </div>
                  </Link>
                ))
              ) : (
                <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                  Hiện chưa có bài viết nào trong mục này.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Hall of Fame Testimonials (Optional - keep existing layout but move below News if desired, or keep here) */}
      {testimonials && testimonials.length > 0 && (
        <section className={styles.testimonialsSection}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2>Hành Trình Học Viên</h2>
              <p>Hear from our outstanding achievers.</p>
            </div>
            <div className={styles.testimonialGrid}>
              {testimonials.map((t) => (
                <div key={t.id} className={styles.testimonialCard}>
                  <div className={styles.quoteIcon}>
                    <LucideIcons.Quote size={40} color="var(--color-orange)" />
                  </div>
                  <p className={styles.testimonialContent}>"{t.content}"</p>
                  <div className={styles.testimonialAuthor}>
                    <div className={styles.authorAvatar}>
                      {t.avatarUrl ? (
                        <Image src={t.avatarUrl} alt={t.authorName} fill style={{ objectFit: 'cover' }} />
                      ) : (
                        <LucideIcons.User size={32} color="#f0f0f8" />
                      )}
                    </div>
                    <div className={styles.authorInfo}>
                      <h4>{t.authorName}</h4>
                      {t.score ? (
                        <span className={styles.authorScore}>Score: {t.score}</span>
                      ) : (
                        <span className={styles.authorRole}>{t.authorRole || 'Student'}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 10. Contact CTA Section */}
      <section className={styles.ctaSection}>
        <div className="container">
          <h2>Ready to Start Your English Journey?</h2>
          <p style={{ fontSize: "var(--text-xl)" }}>Đăng ký ngay để nhận tư vấn và lộ trình học tập miễn phí.</p>
          <div className={styles.ctaButtons}>
            <Link href="/contact#consult" className="btn-secondary" style={{ backgroundColor: 'white', color: 'var(--color-navy)', border: 'none' }}>Đăng ký tư vấn</Link>
            <Link href="/contact" className="btn-dark" style={{ backgroundColor: 'var(--color-navy-dark)', color: 'white', border: 'none' }}>Liên hệ Academy</Link>
          </div>
        </div>
      </section>
    </div>
  );
}