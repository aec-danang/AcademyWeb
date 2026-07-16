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
    if (programs && programs.length > 0) {
      ScrollTrigger.batch(`.${styles.programCard}`, {
        onEnter: (batch) => gsap.fromTo(batch, 
          { opacity: 0, y: 60 }, 
          { opacity: 1, y: 0, stagger: 0.1, duration: 1, ease: "power4.out", overwrite: true }
        ),
        start: "top 85%"
      });
    }

    // 3. Quick Links Section
    if (document.querySelector('.quick-links-section')) {
      gsap.fromTo(".quick-links-section .btn-secondary", 
      { y: 20, opacity: 0 },
      {
        scrollTrigger: {
          trigger: `.quick-links-section`,
          start: "top 85%"
        },
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.15,
        ease: "power4.out"
      }
    );
    }

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

    // 7. Stats Section Counter
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
          start: "top 85%",
        },
        onUpdate: () => {
          el.innerText = prefix + Math.floor(counter.val).toLocaleString() + suffix;
        }
      });
    });

    // 8. Features Section
    if (features && features.length > 0) {
      gsap.fromTo(`.${styles.featuresGrid} > div`,
        { opacity: 0, y: 50 },
        {
          scrollTrigger: {
            trigger: `.${styles.featuresSection}`,
            start: "top 80%"
          },
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: "power4.out"
        }
      );
    }

    // 9. Events, News & Testimonials Animations
    const headers = gsap.utils.toArray(`.${styles.sectionHeader}`);
    if (headers.length > 0) {
      gsap.fromTo(`.${styles.sectionHeader}`, 
        { opacity: 0, y: 30 },
        {
          scrollTrigger: {
            trigger: `.${styles.sectionHeader}`,
            start: "top 85%"
          },
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.2
        }
      );
    }

  }, { scope: containerRef, dependencies: [programs, features, events, news, testimonials] });

  return (
    <div ref={containerRef}>
      {/* Top Banner Area */}
      <section className={styles.topBanner}>
        <div className={styles.topBannerImageWrapper}>
          {/* Example full sized background image */}
          <div style={{ width: '100%', height: '200px', backgroundColor: 'var(--color-navy-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', position: 'relative' }}>
            <Image 
                src="/images/placeholder.svg" 
                alt="Banner" 
                fill 
                style={{ objectFit: 'cover', opacity: 0.5 }} 
              />
            <h2 style={{ zIndex: 1, position: 'relative' }}>Welcome to Academy English Center</h2>
          </div>
        </div>
      </section>

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

      {/* Stats Section */}
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

      {/* Key Features Section */}
      <section className={styles.featuresSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 style={{ color: 'var(--color-white)' }}>Đặc điểm nổi bật</h2>
            <p style={{ color: '#aeb0cc' }}>What makes Academy English Center stand out.</p>
          </div>
          <div className={styles.featuresGrid}>
            {features.map((feature) => {
              // Convert kebab-case (e.g. graduation-cap) to PascalCase (GraduationCap)
              const iconName = feature.iconValue.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
              // @ts-ignore
              const Icon = LucideIcons[iconName] || LucideIcons.CheckCircle;
              return (
                <div key={feature.id} className={styles.featureItem}>
                  <div className={styles.featureIconWrapper}>
                    <Icon size={32} strokeWidth={2} />
                  </div>
                  <div className={styles.featureContent}>
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                  </div>
                </div>
              );
            })}
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
      <section className="quick-links-section" style={{ padding: "40px 0", backgroundColor: "#f0f0f8" }}>
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
        <section className={styles.newsSection}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2>Latest Posts</h2>
              <p>Tips, guides, and stories from AEC.</p>
            </div>
            <div className={styles.newsGrid}>
              {posts.map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}`} className={styles.newsCard}>
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
              <h2 style={{ color: 'var(--color-white)' }}>Hall of Fame</h2>
              <p style={{ color: '#aeb0cc' }}>Hear from our outstanding achievers.</p>
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
                        <LucideIcons.User size={24} color="#aeb0cc" />
                      )}
                    </div>
                    <div className={styles.authorInfo}>
                      <h4>{t.authorName}</h4>
                      {t.score ? (
                        <span className={styles.authorScore}>{t.score}</span>
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
            <Link href="/contact#register" className="btn-secondary">Book Placement Test</Link>
            <Link href="/contact" className="btn-dark">Contact Us</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
