"use client";

import React, { useRef } from "react";
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

type SiteProgram = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  iconType: string;
  iconValue: string;
};

export default function LandingClient({ programs }: { programs: SiteProgram[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // 1. Hero Section Animation (Runs on load)
    const heroTl = gsap.timeline();
    heroTl.from(`.${styles.heroContent} > *`, {
      y: 40,
      opacity: 0,
      duration: 1.2,
      stagger: 0.15,
      ease: "power4.out",
      delay: 0.1
    })
    .from(`.${styles.heroImage}`, {
      x: 40,
      opacity: 0,
      duration: 1.2,
      ease: "power4.out"
    }, "-=0.8");

    // 2. Programs Section (ScrollTrigger Batching)
    ScrollTrigger.batch(`.${styles.programCard}`, {
      onEnter: (batch) => gsap.fromTo(batch, 
        { opacity: 0, y: 60 }, 
        { opacity: 1, y: 0, stagger: 0.1, duration: 1, ease: "power4.out", overwrite: true }
      ),
      start: "top 85%"
    });

    // 3. Quick Links Section
    gsap.fromTo("section:nth-of-type(3) .btn-secondary", 
      { y: 20, opacity: 0 },
      {
        scrollTrigger: {
          trigger: `section:nth-of-type(3)`,
          start: "top 85%"
        },
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.15,
        ease: "power4.out"
      }
    );

    // 4. Why Choose AEC Section
    ScrollTrigger.batch(`.${styles.whyGrid} > div`, {
      onEnter: (batch) => gsap.fromTo(batch,
        { opacity: 0, y: 60 },
        { opacity: 1, y: 0, stagger: 0.15, duration: 1, ease: "power4.out", overwrite: true }
      ),
      start: "top 85%"
    });

    // 5. Mission/Vision Section
    gsap.from(`.${styles.mvCard}`, {
      scrollTrigger: {
        trigger: `.${styles.missionVision}`,
        start: "top 80%"
      },
      y: 50,
      opacity: 0,
      duration: 1,
      stagger: 0.2,
      ease: "power4.out"
    });

    // 6. CTA Section
    gsap.fromTo(`.${styles.ctaSection} .container > *`, 
      { y: 40, opacity: 0 },
      {
        scrollTrigger: {
          trigger: `.${styles.ctaSection}`,
          start: "top 85%"
        },
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.15,
        ease: "power4.out"
      }
    );

  }, { scope: containerRef });

  return (
    <div ref={containerRef}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroContainer}`}>
          <div className={styles.heroContent}>
            <h1>Learn English. Build Confidence. Become a Global Citizen.</h1>
            <p>Academy English Center provides high-quality English programs for kids, teens, IELTS learners, working adults, and corporate teams in Da Nang.</p>
            <div className={styles.heroButtons}>
              <Link href="#programs" className="btn-primary">Find Your Course</Link>
              <Link href="/contact#register" className="btn-secondary">Book Placement Test</Link>
            </div>
          </div>
          <div className={styles.heroImage}>
            <div className={styles.imageWrapper}>
              <Image 
                src="/images/hero.png" 
                alt="Happy students learning at Academy English Center" 
                fill 
                sizes="(max-width: 992px) 100vw, 50vw"
                style={{ objectFit: "cover" }} 
                priority
              />
              <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(44, 45, 101, 0.1)" }}></div>
            </div>
            <div className={styles.badge}>
              <LucideIcons.Trophy color="var(--color-orange)" size={24} />
              <div>
                <div style={{ fontSize: "14px", color: "#5f607a", fontWeight: "normal" }}>Founded in</div>
                <div>2006</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className={styles.programs} id="programs">
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2>Our Programs</h2>
            <p>International-standard English training for all ages and goals.</p>
          </div>
          <div className={styles.programsGrid}>
            {programs.map((program) => {
              let IconComponent = null;
              if (program.iconType === "lucide") {
                // @ts-ignore
                const LucideIcon = LucideIcons[program.iconValue];
                IconComponent = LucideIcon ? <LucideIcon size={48} strokeWidth={1.5} /> : <LucideIcons.FileQuestion size={48} strokeWidth={1.5} />;
              }

              return (
                <Link key={program.id} href={`/programs/${program.slug}`} style={{ display: "block", textDecoration: "none" }}>
                  <Card className={styles.programCard} style={program.iconType === "image" ? { height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" } : undefined}>
                    {program.iconType === "image" ? (
                      <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px", height: "64px", width: "100%", position: "relative" }}>
                        <Image src={program.iconValue} alt={program.title} fill style={{ objectFit: 'contain' }} sizes="200px" />
                      </div>
                    ) : (
                      <div className={styles.programIcon}>{IconComponent}</div>
                    )}
                    <h3>{program.title}</h3>
                    <p style={{ marginTop: "12px", color: "#5f607a" }}>{program.description}</p>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section style={{ padding: "40px 0", backgroundColor: "#f0f0f8" }}>
        <div className="container" style={{ display: "flex", justifyContent: "center", gap: "24px", flexWrap: "wrap" }}>
          <Link href="/schedule" className="btn-secondary">View Opening Schedule</Link>
          <Link href="/news" className="btn-secondary">News & Events</Link>
          <Link href="/blog" className="btn-secondary">Our Blog</Link>
        </div>
      </section>

      {/* Why Choose AEC */}
      <section className={styles.whyChoose}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2>Why Choose AEC?</h2>
            <p>Our commitment to your future.</p>
          </div>
          <div className={styles.whyGrid}>
            <Card>
              <h3 className="text-orange" style={{ marginBottom: "16px" }}>1. High-Quality Training</h3>
              <p>Provide high-quality, diverse, international-standard English training.</p>
            </Card>
            <Card>
              <h3 className="text-orange" style={{ marginBottom: "16px" }}>2. Soft Skills & Values</h3>
              <p>Develop soft skills and life values so learners become confident global citizens.</p>
            </Card>
            <Card>
              <h3 className="text-orange" style={{ marginBottom: "16px" }}>3. Humanistic Education</h3>
              <p>Maintain professionalism and humanistic education values, putting student needs and character first.</p>
            </Card>
            <Card>
              <h3 className="text-orange" style={{ marginBottom: "16px" }}>4. Dedicated Community</h3>
              <p>Build a dedicated learning and service community for the future of learners and society.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className={styles.missionVision}>
        <div className="container">
          <div className={styles.mvGrid}>
            <div className={styles.mvCard}>
              <h3>Our Vision</h3>
              <p>Build ACADEMY AEC into a dedicated learning community that serves carefully, wholeheartedly, and professionally for the future of learners and society.</p>
            </div>
            <div className={styles.mvCard}>
              <h3>Our Mission</h3>
              <p>Educate people through English so they become successful global citizens responsible toward themselves and the community.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className="container">
          <h2>Not sure which course fits you?</h2>
          <p style={{ fontSize: "var(--text-xl)" }}>Take a placement test and get a personalized learning path.</p>
          <div className={styles.ctaButtons}>
            <Link href="/contact#register" className="btn-secondary">Book Placement Test</Link>
            <Link href="/contact" className="btn-dark">Contact Us</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
