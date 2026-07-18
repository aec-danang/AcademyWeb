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

type SiteFeature = {
  id: string;
  title: string;
  description: string;
  iconValue: string;
};

type SitePost = {
  slug: string;
  title: string;
  excerpt: string | null;
  featuredImage: string | null;
  createdAt: Date;
};

type SiteTestimonial = {
  id: string;
  authorName: string;
  authorRole: string | null;
  content: string;
  avatarUrl: string | null;
  score: string | null;
  isHallOfFame: boolean;
  isFeatured: boolean;
};

export default function LandingClient({ 
  programs,
  features,
  settings,
  events,
  news,
  posts,
  testimonials
}: { 
  programs: SiteProgram[];
  features: SiteFeature[];
  settings: Record<string, string>;
  events: SitePost[];
  news: SitePost[];
  posts: SitePost[];
  testimonials: SiteTestimonial[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);

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
    })
    .from(`.${styles.visualShape1}, .${styles.visualShape2}, .${styles.visualShape3}`, {
      scale: 0.5,
      opacity: 0,
      duration: 1.5,
      stagger: 0.2,
      ease: "power4.out"
    }, "-=0.8")
    .from(`.${styles.glassCard}`, {
      y: 30,
      opacity: 0,
      duration: 1,
      stagger: 0.2,
      ease: "back.out(1.5)"
    }, "-=1");

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

    // 3. Bento Box (Why Choose AEC / Features)
    ScrollTrigger.batch(`.${styles.bentoGrid} > div`, {
      onEnter: (batch) => gsap.fromTo(batch,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, stagger: 0.15, duration: 1, ease: "power4.out", overwrite: true }
      ),
      start: "top 85%"
    });

    // 4. Programs Section
    if (programs && programs.length > 0) {
      ScrollTrigger.batch(`.${styles.programCard}`, {
        onEnter: (batch) => gsap.fromTo(batch, 
          { opacity: 0, y: 40 }, 
          { opacity: 1, y: 0, stagger: 0.1, duration: 0.8, ease: "power4.out", overwrite: true }
        ),
        start: "top 85%"
      });
    }

    // 5. Events, News & Testimonials Animations
    const headers = gsap.utils.toArray(`.${styles.sectionHeader}`);
    headers.forEach(header => {
      gsap.fromTo(header as HTMLElement, 
        { opacity: 0, y: 30 },
        {
          scrollTrigger: {
            trigger: header as HTMLElement,
            start: "top 90%"
          },
          opacity: 1,
          y: 0,
          duration: 0.8
        }
      );
    });

    // CTA
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

  }, { scope: containerRef, dependencies: [programs, features, events, news, testimonials] });

  return (
    <div ref={containerRef}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroContainer}`}>
          <div className={styles.heroContent}>
            <h1>
              <span className={styles.heroHighlight}>Learn English.</span><br />
              Build Confidence.<br />
              Become a <span className={styles.heroHighlight}>Global Citizen.</span>
            </h1>
            <p>Academy English Center provides high-quality, international-standard English programs for kids, teens, working adults, and corporate teams in Da Nang.</p>
            <div className={styles.heroButtons}>
              <Link href="#programs" className="btn-primary">Find Your Course</Link>
              <Link href="/contact#register" className="btn-secondary" style={{ backgroundColor: 'white' }}>Book Placement Test</Link>
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
                <div>2006</div>
              </div>
            </div>
            
            <div className={`${styles.glassCard} ${styles.glassCard2}`}>
              <div className={styles.glassCardIcon}>
                <LucideIcons.Star size={24} />
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#5f607a', fontWeight: 'normal' }}>Top Rated</div>
                <div>English Center</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section (Overlapping Hero) */}
      <section className={styles.statsSection}>
        <div className="container">
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>{settings.stats_native_teachers || '40+'}</div>
              <div className={styles.statLabel}>Native Teachers</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>{settings.stats_happy_students || '15,000+'}</div>
              <div className={styles.statLabel}>Happy Students</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>{settings.stats_years_experience || '15+'}</div>
              <div className={styles.statLabel}>Years of Experience</div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section style={{ padding: "80px 0", backgroundColor: "var(--color-white)" }}>
        <div className="container" style={{ textAlign: "center", maxWidth: "800px" }}>
          <h2 style={{ fontSize: "var(--text-3xl)", marginBottom: "24px", color: "var(--color-navy)" }}>About Academy English Center</h2>
          <p style={{ fontSize: "var(--text-lg)", lineHeight: 1.8, color: "var(--color-navy-light)" }}>
            Founded in 2006, Academy English Center (AEC) has been a leading English education center in Da Nang. We provide high-quality, international-standard English training to help learners become confident global citizens.
          </p>
        </div>
      </section>

      {/* Bento Box: Why Choose AEC & Mission/Vision */}
      <section className={styles.bentoSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2>Why Choose AEC?</h2>
            <p>Our commitment to your future and development.</p>
          </div>
          <div className={styles.bentoGrid}>
            {/* Card 1: Span 2 */}
            <div className={`${styles.bentoCard} ${styles.bentoCard1}`}>
              <div className={styles.bentoIcon}>
                <LucideIcons.GraduationCap size={32} />
              </div>
              <div className={styles.bentoContent}>
                <h3>High-Quality Training</h3>
                <p>Provide high-quality, diverse, international-standard English training. We ensure every student reaches their full potential with modern methodologies.</p>
              </div>
            </div>
            
            {/* Card 2 */}
            <div className={`${styles.bentoCard} ${styles.bentoCard2}`}>
              <div className={styles.bentoIcon}>
                <LucideIcons.HeartHandshake size={32} />
              </div>
              <div className={styles.bentoContent}>
                <h3>Soft Skills</h3>
                <p>Develop soft skills and life values so learners become confident global citizens.</p>
              </div>
            </div>

            {/* Card 3 */}
            <div className={`${styles.bentoCard} ${styles.bentoCard3}`}>
              <div className={styles.bentoIcon}>
                <LucideIcons.BookOpen size={32} />
              </div>
              <div className={styles.bentoContent}>
                <h3>Humanistic Education</h3>
                <p>Maintain professionalism and humanistic values, putting student character first.</p>
              </div>
            </div>

            {/* Card 4: Span 2 */}
            <div className={`${styles.bentoCard} ${styles.bentoCard4}`}>
              <div className={styles.bentoIcon}>
                <LucideIcons.Globe2 size={32} />
              </div>
              <div className={styles.bentoContent}>
                <h3>Our Vision & Mission</h3>
                <p>Build AEC into a dedicated learning community that serves carefully, wholeheartedly, and professionally. We aim to educate people through English so they become successful global citizens responsible toward themselves and the community.</p>
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
                      <div style={{ display: "flex", justifySelf: "center", marginBottom: "16px", height: "64px", width: "100%", position: "relative" }}>
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
      <section className="quick-links-section" style={{ padding: "40px 0", backgroundColor: "var(--color-white)", borderBottom: "1px solid #f0f0f8" }}>
        <div className="container" style={{ display: "flex", justifyContent: "center", gap: "24px", flexWrap: "wrap" }}>
          <Link href="/news" className="btn-secondary">News & Events</Link>
          <Link href="/posts" className="btn-secondary">Our Blog</Link>
        </div>
      </section>

      {/* Events Section */}
      {events.length > 0 && (
        <section className={styles.eventsSection}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2>Upcoming Events</h2>
              <p>Join our interactive workshops, camps, and activities.</p>
            </div>
            <div className={styles.carouselContainer}>
              {events.map((event) => (
                <Link key={event.slug} href={`/news/${event.slug}`} className={styles.eventCard}>
                  <div className={styles.eventImageWrapper}>
                    <Image 
                      src={event.featuredImage || "/images/placeholder.svg"} 
                      alt={event.title} 
                      fill 
                      style={{ objectFit: 'cover' }} 
                    />
                  </div>
                  <div className={styles.eventContent}>
                    <h3>{event.title}</h3>
                    {event.excerpt && <p>{event.excerpt}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* News Section */}
      {news.length > 0 && (
        <section className={styles.newsSection}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2>Latest News</h2>
              <p>Stay updated with AEC.</p>
            </div>
            <div className={styles.newsGrid}>
              {news.map((n) => (
                <Link key={n.slug} href={`/news/${n.slug}`} className={styles.newsCard}>
                  {n.featuredImage && (
                    <div className={styles.newsImageWrapper}>
                      <Image src={n.featuredImage} alt={n.title} fill style={{ objectFit: 'cover' }} />
                    </div>
                  )}
                  <div className={styles.newsContent}>
                    <span className={styles.newsDate} suppressHydrationWarning>
                      {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <h3>{n.title}</h3>
                    {n.excerpt && <p>{n.excerpt}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Posts Section */}
      {posts && posts.length > 0 && (
        <section className={styles.eventsSection} style={{ backgroundColor: 'var(--color-white)' }}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2>Latest Posts</h2>
              <p>Tips, guides, and stories from AEC.</p>
            </div>
            <div className={styles.newsGrid}>
              {posts.map((p) => (
                <Link key={p.slug} href={`/posts/${p.slug}`} className={styles.newsCard} style={{ backgroundColor: '#f0f0f8' }}>
                  {p.featuredImage && (
                    <div className={styles.newsImageWrapper}>
                      <Image src={p.featuredImage} alt={p.title} fill style={{ objectFit: 'cover' }} />
                    </div>
                  )}
                  <div className={styles.newsContent}>
                    <span className={styles.newsDate} suppressHydrationWarning>
                      {new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <h3>{p.title}</h3>
                    {p.excerpt && <p>{p.excerpt}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Hall of Fame Testimonials */}
      {testimonials.length > 0 && (
        <section className={styles.testimonialsSection}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2>Hall of Fame</h2>
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

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className="container">
          <h2>Not sure which course fits you?</h2>
          <p style={{ fontSize: "var(--text-xl)" }}>Take a placement test and get a personalized learning path.</p>
          <div className={styles.ctaButtons}>
            <Link href="/contact#register" className="btn-secondary" style={{ backgroundColor: 'white', color: 'var(--color-navy)', border: 'none' }}>Book Placement Test</Link>
            <Link href="/contact" className="btn-dark" style={{ backgroundColor: 'var(--color-navy-dark)', color: 'white', border: 'none' }}>Contact Us</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
