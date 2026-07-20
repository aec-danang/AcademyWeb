"use client";

import { useEffect, useState, useRef } from "react";
import { Target, Users, BookOpen, Heart, Globe, Award } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import styles from "./about.module.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

const expectations = [
  {
    icon: Award,
    text: "Provide high-quality, diverse, international-standard English training."
  },
  {
    icon: Globe,
    text: "Develop soft skills and life values so learners become confident global citizens."
  },
  {
    icon: Heart,
    text: "Maintain professionalism and humanistic education values, putting student needs and character first."
  },
  {
    icon: Users,
    text: "Build a dedicated learning and service community for the future of learners and society."
  }
];

export default function AboutClient({ children }: { children?: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Hero Animation
    gsap.fromTo(`.${styles.heroContent} > *`, 
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, stagger: 0.15, ease: "power3.out" }
    );

    // Vision Section Animation
    gsap.fromTo(`.${styles.visionContent} > *`,
      { y: 30, opacity: 0 },
      {
        scrollTrigger: { trigger: `.${styles.visionContent}`, start: "top 85%" },
        y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: "power3.out"
      }
    );

    // Expectations Cards Animation
    ScrollTrigger.batch(`.${styles.card}`, {
      onEnter: (batch) => gsap.fromTo(batch,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, stagger: 0.1, duration: 0.8, ease: "power3.out", overwrite: true }
      ),
      start: "top 90%"
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroBackground}></div>
        <div className={`container ${styles.heroContent}`}>
          <div className={styles.heroBadge}>Giới Thiệu</div>
          <h1 className={styles.heroTitle}>Về Chúng Tôi</h1>
          <p className={styles.heroSubtitle}>
            Founded in 2006, Academy English Center (AEC) has been a leading English education center in Da Nang. We provide high-quality, international-standard English training to help learners become confident global citizens.
          </p>
        </div>
      </section>

      {/* Vision Section */}
      <section className={`${styles.section} ${styles.sectionLight}`}>
        <div className={`container ${styles.visionContent} ${styles.textContent}`}>
          <div style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', width: '80px', height: '80px', backgroundColor: 'var(--color-orange-light)', borderRadius: '50%', color: 'var(--color-orange)', marginBottom: '1.5rem' }}>
            <Target size={40} />
          </div>
          <h2 className={styles.sectionTitle}>Our Vision</h2>
          <p className={styles.sectionText}>
            Build ACADEMY AEC into a dedicated learning community that serves carefully, wholeheartedly, and professionally for the future of learners and society.
          </p>
        </div>
      </section>

      {/* Founder Expectations Section */}
      <section className={`${styles.section} ${styles.sectionDark}`}>
        <div className="container">
          <div className={styles.textContent}>
            <h2 className={styles.sectionTitle}>Founder Expectations</h2>
            <p className={styles.sectionText}>Những giá trị cốt lõi mà chúng tôi cam kết mang lại.</p>
          </div>

          <div className={styles.grid}>
            {expectations.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className={styles.card}>
                  <div className={styles.iconWrapper}>
                    <Icon size={32} />
                  </div>
                  <div className={styles.cardText}>
                    {item.text}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {children}
    </div>
  );
}
