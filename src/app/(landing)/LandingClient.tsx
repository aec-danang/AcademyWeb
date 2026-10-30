"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Trophy,
  Baby,
  UserCircle,
  Award,
  FileText,
  MessageCircle,
  Briefcase,
  FileQuestion,
  Clock,
  Users,
  Map,
  BarChart,
  Tent,
  Laptop,
  PenTool,
  TrendingUp,
  MessageSquare,
  Smartphone,
  BookOpen,
  LifeBuoy,
  Quote,
  User,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Baby,
  UserCircle,
  Award,
  FileText,
  MessageCircle,
  Briefcase,
  Clock,
  Users,
  Map,
  BarChart,
  Tent,
  Laptop,
  PenTool,
  TrendingUp,
  MessageSquare,
  Smartphone,
  BookOpen,
  LifeBuoy,
};
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import styles from "./page.module.css";
import Card from "@/lib/ui/Card";
import { useTheme } from "@/lib/contexts/ThemeProvider";
import { HalloweenScene } from "@/components/seasonal-theme/HalloweenScene";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

const WHY_ACADEMY_POINTS = [
  { title: "Kinh nghiệm giảng dạy", desc: "Thành lập từ 2001, tự hào là đơn vị tiên phong đào tạo Anh ngữ.", icon: "Clock" },
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
  events,
  news,
  posts,
  testimonials,
  studentLifeEvents = [],
  sponsorCount,
  yearsOfExperience,
}: { 
  programs: any[];
  events: any[];
  news: any[];
  posts: any[];
  testimonials: any[];
  studentLifeEvents?: any[];
  sponsorCount: number;
  yearsOfExperience: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeNewsTab, setActiveNewsTab] = useState<'news' | 'events' | 'posts'>('news');
  const { effectsEnabled, seasonalTheme } = useTheme();

  useGSAP(() => {
    if (!effectsEnabled) return;
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
    // 1. Hero Section Animation
    const heroTl = gsap.timeline();
    heroTl.from(`.${styles.heroContent} > *`, {
      y: 16,
      opacity: 0,
      duration: .65,
      stagger: 0.08,
      ease: "power4.out",
      delay: 0.1, clearProps: "transform,opacity"
    });

    gsap.from(`.${styles.statsGrid}`, {
      scrollTrigger: { trigger: `.${styles.statsSection}`, start: "top 90%" },
      y: 16,
      opacity: 0,
      duration: .65,
      ease: "power4.out", clearProps: "transform,opacity"
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
        { opacity: 0, y: 16 },
        {
          scrollTrigger: { trigger: section, start: "top 85%" },
          opacity: 1, y: 0, duration: 0.65, clearProps: "transform,opacity"
        }
      );
      
      const gridItems = gsap.utils.toArray(`${section} [class*="Grid"] > *, ${section} .${styles.timelineItem}`);
      if (gridItems.length > 0) {
        gsap.fromTo(gridItems,
          { opacity: 0, y: 16 },
          {
            scrollTrigger: { trigger: section, start: "top 80%" },
            opacity: 1, y: 0, stagger: 0.08, duration: 0.65, ease: "power3.out", clearProps: "transform,opacity"
          }
        );
      }
    });

    // CTA
    gsap.fromTo(`.${styles.ctaSection} .container > *`, 
      { y: 16, opacity: 0 },
      {
        scrollTrigger: { trigger: `.${styles.ctaSection}`, start: "top 85%" },
        y: 0, opacity: 1, duration: .65, stagger: 0.08, ease: "power3.out", clearProps: "transform,opacity"
      }
    );

    });
    return () => media.revert();
  }, { scope: containerRef, dependencies: [effectsEnabled, seasonalTheme], revertOnUpdate: true });

  useGSAP(() => {
    if (!effectsEnabled) return;
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(`.${styles.newsGrid} > *`, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: .5, stagger: .08, clearProps: "transform,opacity" });
    });
    return () => media.revert();
  }, { scope: containerRef, dependencies: [activeNewsTab, effectsEnabled], revertOnUpdate: true });

  // Get active items based on tab
  const activeItems = activeNewsTab === 'news' ? news : activeNewsTab === 'events' ? events : posts;

  return (
    <div ref={containerRef} className={styles.landing}>
      {/* 1. Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBackground} aria-hidden="true">
          <Image src="/images/academy-team.png" alt="" fill sizes="100vw" className={styles.heroImage} priority />
        </div>
        <div className={`container ${styles.heroContainer}`}>
          <div className={styles.heroContent}>
            <span className={styles.seasonLabel}>HALLOWEEN TẠI ACADEMY <span aria-hidden="true">✦</span> Học hỏi & khám phá</span>
            <h1>
              <span className={styles.heroHighlight}>Academy</span><br />
              {yearsOfExperience} Năm Đồng Hành<br />
              Cùng <span className={styles.heroHighlight}>Giáo Dục Ngoại Ngữ</span>
            </h1>
            <p>Từ tiền thân Hồng Đức năm 2001, thương hiệu Academy English Center từ 2006. Tự hào mang đến nền tảng ngôn ngữ vững chắc cho các thế hệ học viên.</p>
            <div className={styles.heroButtons}>
              <Link href="/contact#register" className="btn-primary" style={{ boxShadow: "0 8px 20px rgba(239, 106, 55, 0.3)" }}>Đăng ký học thử</Link>
              <Link href="/contact#register" className="btn-secondary" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: "blur(10px)", border: "1px solid rgba(255, 255, 255, 0.5)" }}>Kiểm tra trình độ</Link>
            </div>
          </div>
          <div className={styles.heroVisual}>
            <HalloweenScene />
            
            <div className={`${styles.glassCard} ${styles.glassCard1}`}>
              <div className={styles.glassCardIcon}>
                <Trophy size={24} />
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#5f607a', fontWeight: 'normal' }}>Founded in</div>
                <div style={{ fontWeight: 700, color: "var(--color-navy)" }}>2006</div>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* 2. Trust & Statistics Section */}
      <section className={styles.statsSection}>
        <div className="container">
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>{yearsOfExperience}</div>
              <div className={styles.statLabel}>Years of Experience</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>2006</div>
              <div className={styles.statLabel}>Thương hiệu Academy</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>{programs.length}</div>
              <div className={styles.statLabel}>Chương trình đang công bố</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>{sponsorCount}</div>
              <div className={styles.statLabel}>Đối tác đang công bố</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Our Journey */}
      <section className={styles.journeySection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2>Our Journey</h2>
            <p>{yearsOfExperience} Years of Educational Excellence</p>
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
            {programs.map((program) => {
              const Icon = (program.icon && ICON_MAP[program.icon]) || Award;
              const IconComponent = <Icon size={44} strokeWidth={1.5} />;

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
            {programs.length === 0 ? <p className={styles.emptyState}>Chưa có chương trình nào được công bố.</p> : null}
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
              const Icon = ICON_MAP[point.icon];
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
              const Icon = ICON_MAP[support.icon];
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
              <p className={styles.emptyState}>Chưa có hình ảnh hoạt động được đăng.</p>
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
                activeItems.slice(0, 3).map((item) => {
                  const itemHref = activeNewsTab === 'posts' ? `/posts/${item.slug}` : `/news/${item.slug}`;
                  return (
                    <Link key={item.slug} href={itemHref} className={styles.newsCard}>
                      {item.featuredImage ? (
                        <div className={styles.newsImageWrapper}>
                          <Image src={item.featuredImage} alt={item.title} fill style={{ objectFit: 'cover' }} />
                        </div>
                      ) : (
                      <div className={styles.newsImageWrapper}>
                        <div className={styles.imagePlaceholder} aria-hidden="true"><BookOpen size={28} /></div>
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
                );
              })
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
                    <Quote size={40} color="var(--color-orange)" />
                  </div>
                  <p className={styles.testimonialContent}>"{t.content}"</p>
                  <div className={styles.testimonialAuthor}>
                    <div className={styles.authorAvatar}>
                      {t.avatarUrl ? (
                        <Image src={t.avatarUrl} alt={t.authorName} fill style={{ objectFit: 'cover' }} />
                      ) : (
                        <User size={32} color="#f0f0f8" />
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
            <Link href="/contact#register" className="btn-secondary" style={{ backgroundColor: 'white', color: 'var(--color-navy)', border: 'none' }}>Đăng ký tư vấn</Link>
            <Link href="/contact" className="btn-dark" style={{ backgroundColor: 'var(--color-navy-dark)', color: 'white', border: 'none' }}>Liên hệ Academy</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
