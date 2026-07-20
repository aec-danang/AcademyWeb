"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, ArrowRight, Book, Layers, Pencil, GraduationCap, Globe, Lightbulb } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import styles from "./programs.module.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

// Map database icon strings to Lucide components if needed, or provide fallbacks
const iconMap: Record<string, React.ElementType> = {
  "Book": Book,
  "Layers": Layers,
  "Pencil": Pencil,
  "GraduationCap": GraduationCap,
  "Globe": Globe,
  "Lightbulb": Lightbulb,
};

type SiteProgram = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  iconType: string;
  iconValue: string;
};

export default function ProgramsClient({ programs }: { programs: SiteProgram[] }) {
  const [mounted, setMounted] = useState(false);
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

    // Cards Animation
    if (programs.length > 0) {
      ScrollTrigger.batch(`.${styles.card}`, {
        onEnter: (batch) => gsap.fromTo(batch,
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, stagger: 0.1, duration: 0.8, ease: "power3.out", overwrite: true }
        ),
        start: "top 90%"
      });
    } else {
       gsap.fromTo(`.${styles.emptyState}`,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
       );
    }
  }, { scope: containerRef });

  return (
    <div ref={containerRef}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroBackground}></div>
        <div className={`container ${styles.heroContent}`}>
          <div className={styles.heroBadge}>Khóa Học</div>
          <h1 className={styles.heroTitle}>Các Chương trình Đào tạo</h1>
          <p className={styles.heroSubtitle}>
            Hệ thống chương trình đào tạo chuẩn quốc tế được thiết kế riêng biệt cho mọi độ tuổi và mục tiêu học tập, giúp bạn khai phóng tiềm năng ngôn ngữ.
          </p>
        </div>
      </section>

      {/* Grid Layout */}
      <section className={styles.programsWrapper}>
        <div className="container">
          <div className={styles.programsGrid}>
            {programs.length > 0 ? (
              programs.map((program) => {
                let IconComponent: any = BookOpen;
                if (program.iconType === "lucide" && iconMap[program.iconValue]) {
                  IconComponent = iconMap[program.iconValue];
                }

                return (
                  <Link key={program.id} href={`/programs/${program.slug}`} style={{ textDecoration: "none" }}>
                    <div className={`${styles.card} ${mounted ? styles.cardVisible : ""}`}>
                      <div className={styles.iconWrapper}>
                        {program.iconType === "image" ? (
                          <div style={{ position: "relative", width: "48px", height: "48px" }}>
                            <Image src={program.iconValue} alt={program.title} fill style={{ objectFit: 'contain' }} />
                          </div>
                        ) : (
                          <IconComponent size={32} strokeWidth={1.5} />
                        )}
                      </div>
                      
                      <h2 className={styles.programTitle}>{program.title}</h2>
                      <p className={styles.programDesc}>{program.description}</p>
                      
                      <div className={styles.readMoreBtn}>
                        Xem chi tiết <ArrowRight size={18} className={styles.readMoreIcon} />
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className={`${styles.emptyState} ${mounted ? styles.cardVisible : ""}`}>
                <div className={styles.emptyStateIcon}>
                  <BookOpen size={32} />
                </div>
                <h3>Chưa có chương trình nào</h3>
                <p>Chúng tôi đang cập nhật nội dung chương trình học. Vui lòng quay lại sau.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
