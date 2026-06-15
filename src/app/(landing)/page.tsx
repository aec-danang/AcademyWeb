import Link from "next/link";
import Image from "next/image";
import { Trophy, Baby, GraduationCap, Briefcase, Building } from "lucide-react";
import styles from "./page.module.css";
import Card from "@/lib/ui/Card";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroContainer}`}>
          <div className={styles.heroContent}>
            <h1>Learn English. Build Confidence. Become a Global Citizen.</h1>
            <p>Academy English Center provides high-quality English programs for kids, teens, IELTS learners, working adults, and corporate teams in Da Nang.</p>
            <div className={styles.heroButtons}>
              <Link href="/programs" className="btn-primary">Find Your Course</Link>
              <Link href="/contact#register" className="btn-secondary">Book Placement Test</Link>
            </div>
          </div>
          <div className={styles.heroImage}>
            <div style={{ padding: "40px", textAlign: "center", color: "var(--color-orange-700)" }}>
              [Hero Image Placeholder]<br/>Happy students learning
            </div>
            <div className={styles.badge}>
              <Trophy color="var(--color-orange)" size={24} />
              <div>
                <div style={{ fontSize: "14px", color: "var(--text-muted)", fontWeight: "normal" }}>Founded in</div>
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
            <Link href="/programs/kids" style={{ display: "block", textDecoration: "none" }}>
              <Card className={styles.programCard}>
                <div className={styles.programIcon}><Baby size={48} strokeWidth={1.5} /></div>
                <h3>English for Kids</h3>
                <p style={{ marginTop: "12px", color: "var(--text-muted)" }}>Interactive learning for young minds (6-11 years).</p>
              </Card>
            </Link>
            <Link href="/programs/teens" style={{ display: "block", textDecoration: "none" }}>
              <Card className={styles.programCard}>
                <div className={styles.programIcon}><Baby size={48} strokeWidth={1.5} /></div>
                <h3>English for Teens</h3>
                <p style={{ marginTop: "12px", color: "var(--text-muted)" }}>Building foundation for success (11-15 years).</p>
              </Card>
            </Link>
            <Link href="/programs/ielts" style={{ display: "block", textDecoration: "none" }}>
              <Card className={styles.programCard}>
                <div className={styles.programIcon}><GraduationCap size={48} strokeWidth={1.5} /></div>
                <h3>IELTS Prep</h3>
                <p style={{ marginTop: "12px", color: "var(--text-muted)" }}>Achieve your target score.</p>
              </Card>
            </Link>
            <Link href="/programs/testprep" style={{ display: "block", textDecoration: "none" }}>
              <Card className={styles.programCard}>
                <div className={styles.programIcon}><GraduationCap size={48} strokeWidth={1.5} /></div>
                <h3>Test Prep</h3>
                <p style={{ marginTop: "12px", color: "var(--text-muted)" }}>TOEFL iBT, TOEIC, SAT, CERF.</p>
              </Card>
            </Link>
            <Link href="/programs/communication" style={{ display: "block", textDecoration: "none" }}>
              <Card className={styles.programCard}>
                <div className={styles.programIcon}><Briefcase size={48} strokeWidth={1.5} /></div>
                <h3>Adults & Comm</h3>
                <p style={{ marginTop: "12px", color: "var(--text-muted)" }}>Confidence in daily communication.</p>
              </Card>
            </Link>
            <Link href="/programs/corporate" style={{ display: "block", textDecoration: "none" }}>
              <Card className={styles.programCard}>
                <div className={styles.programIcon}><Building size={48} strokeWidth={1.5} /></div>
                <h3>Corporate English</h3>
                <p style={{ marginTop: "12px", color: "var(--text-muted)" }}>Empower your workforce.</p>
              </Card>
            </Link>
            <Link href="/programs/public-speaking" style={{ display: "block", textDecoration: "none" }}>
              <Card className={styles.programCard}>
                <div className={styles.programIcon}><Trophy size={48} strokeWidth={1.5} /></div>
                <h3>Public Speaking</h3>
                <p style={{ marginTop: "12px", color: "var(--text-muted)" }}>Master presentation & debate skills.</p>
              </Card>
            </Link>
            <Link href="/study-abroad" style={{ display: "block", textDecoration: "none" }}>
              <Card className={styles.programCard}>
                <div className={styles.programIcon}><Briefcase size={48} strokeWidth={1.5} /></div>
                <h3>Study Abroad & Summer Camp</h3>
                <p style={{ marginTop: "12px", color: "var(--text-muted)" }}>Global experiences and consulting.</p>
              </Card>
            </Link>
            <Link href="/addc" style={{ display: "block", textDecoration: "none" }}>
              <Card className={styles.programCard} style={{ height: "100%" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px", height: "48px", alignItems: "center" }}>
                  <Image src="/logos/addc/addc-logo.png" alt="ADDC Logo" width={120} height={48} style={{ objectFit: 'contain' }} />
                </div>
                <p style={{ marginTop: "12px", color: "var(--text-muted)" }}>Speaking & debating for kids and teenagers.</p>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section style={{ padding: "40px 0", backgroundColor: "var(--color-neutral-100)" }}>
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
    </>
  );
}
