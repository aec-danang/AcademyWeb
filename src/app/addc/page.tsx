import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";
import { Mic, Brain, Handshake, Trophy } from "lucide-react";

export const metadata = {
  title: "ADDC - Academy Debate & Discussion Club | AEC",
  description: "Join the Academy Debate & Discussion Club at AEC. We empower kids and teenagers to find their voice, think critically, and debate with confidence.",
};

export default function ADDCPage() {
  return (
    <>
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroContent}>
            <div className={styles.logoContainer}>
              <Image 
                src="/logos/addc/logo-debate.png" 
                alt="ADDC Logo" 
                width={400} 
                height={200} 
                className={styles.logo}
                style={{ objectFit: 'contain', maxWidth: '300px' }}
              />
            </div>
            <h1 style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', borderWidth: 0 }}>
              Academy Debate & Discussion Club (ADDC)
            </h1>
            <p>Empowering kids and teenagers to find their voice, think critically, and debate with confidence.</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
              <Link href="/contact#register" className="btn-primary">Join the Club</Link>
              <Link href="#about" className="btn-secondary">Learn More</Link>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className={styles.about}>
        <div className="container">
          <div className={styles.aboutGrid}>
            <div className={styles.aboutText}>
              <h2>Speak up. Stand out.</h2>
              <p>
                The Academy Debate & Discussion Club (ADDC) is an exclusive club at Academy English Center designed for kids and teenagers. We provide a supportive environment where young minds can develop essential public speaking, critical thinking, and structured debate skills.
              </p>
              <p>
                Whether your child is looking to overcome stage fright, build leadership qualities, or prepare for academic competitions, ADDC is the perfect place to start.
              </p>
              
              <div className={styles.featuresGrid}>
                <div className={styles.featureCard}>
                  <h3 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><Mic size={24} /> Public Speaking</h3>
                  <p style={{color: 'var(--text-muted)'}}>Build confidence on stage.</p>
                </div>
                <div className={styles.featureCard}>
                  <h3 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><Brain size={24} /> Critical Thinking</h3>
                  <p style={{color: 'var(--text-muted)'}}>Analyze complex topics.</p>
                </div>
                <div className={styles.featureCard}>
                  <h3 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><Handshake size={24} /> Teamwork</h3>
                  <p style={{color: 'var(--text-muted)'}}>Collaborate effectively.</p>
                </div>
                <div className={styles.featureCard}>
                  <h3 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><Trophy size={24} /> Competitions</h3>
                  <p style={{color: 'var(--text-muted)'}}>Test skills in real debates.</p>
                </div>
              </div>
            </div>
            <div>
               <Image 
                  src="/logos/addc/dolphin-logo-with-sky.png" 
                  alt="ADDC Dolphin" 
                  width={600} 
                  height={600} 
                  style={{ width: '100%', height: 'auto', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)' }}
                />
            </div>
          </div>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className="container">
          <h2>Ready to Raise Your Voice?</h2>
          <p style={{ fontSize: "var(--text-xl)" }}>Join ADDC today and become a confident global citizen.</p>
          <div className={styles.ctaButtons}>
            <Link href="/contact#register" className="btn-secondary">Register Now</Link>
            <Link href="/contact" className="btn-dark">Contact Us</Link>
          </div>
        </div>
      </section>
    </>
  );
}
