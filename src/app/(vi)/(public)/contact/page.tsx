"use client";

import { useEffect, useRef } from "react";
import ContactFormClient from "./ContactFormClient";
import styles from "./contact.module.css";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export default function ContactPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Hero Animation
    gsap.fromTo(`.${styles.heroContent} > *`,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, stagger: 0.15, ease: "power3.out" }
    );

    // Content Wrapper Animation
    gsap.fromTo(`.${styles.infoColumn} > *`,
      { x: -30, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.8, stagger: 0.15, delay: 0.3, ease: "power3.out" }
    );

    gsap.fromTo(`.${styles.formCard}`,
      { x: 30, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.8, delay: 0.5, ease: "power3.out" }
    );

    gsap.fromTo(`.${styles.mapSection}`,
      { y: 40, opacity: 0 },
      {
        scrollTrigger: { trigger: `.${styles.mapSection}`, start: "top 85%" },
        y: 0, opacity: 1, duration: 0.8, ease: "power3.out"
      }
    );
  }, { scope: containerRef });

  return (
    <div ref={containerRef}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroBackground}></div>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>Contact Us</div>
          <h1 className={styles.heroTitle}>Get in Touch</h1>
          <p style={{ fontSize: "var(--text-lg)", color: "#aeb0cc", lineHeight: 1.6 }}>
            Have questions about our programs or want to register for a placement test? We're here to help!
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className={styles.mainContent}>
        <div className={styles.contentWrapper}>
          
          {/* Contact Information Column */}
          <div className={styles.infoColumn}>
            <div className={styles.infoCard}>
              <h2 className={styles.infoTitle}>Contact Information</h2>
              <div className={styles.contactList}>
                <div className={styles.contactItem}>
                  <div className={styles.iconWrapper}>
                    <MapPin size={24} />
                  </div>
                  <div className={styles.itemDetails}>
                    <h4>Address</h4>
                    <p>98 Le Dinh Ly St, Da Nang</p>
                  </div>
                </div>
                
                <div className={styles.contactItem}>
                  <div className={styles.iconWrapper}>
                    <Phone size={24} />
                  </div>
                  <div className={styles.itemDetails}>
                    <h4>Phone</h4>
                    <p>(0236) 123 4567</p>
                  </div>
                </div>
                
                <div className={styles.contactItem}>
                  <div className={styles.iconWrapper}>
                    <Mail size={24} />
                  </div>
                  <div className={styles.itemDetails}>
                    <h4>Email</h4>
                    <p>info@academy.edu.vn</p>
                  </div>
                </div>
                
                <div className={styles.contactItem}>
                  <div className={styles.iconWrapper}>
                    <Clock size={24} />
                  </div>
                  <div className={styles.itemDetails}>
                    <h4>Working Hours</h4>
                    <p>Mon - Sun: 8:00 AM - 9:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Registration Form Column */}
          <div id="register" className={styles.formCard}>
            <h2 className={styles.formTitle}>Placement Test Registration</h2>
            <p className={styles.formSubtitle}>Fill out the form below and our advisors will contact you shortly.</p>
            <ContactFormClient />
          </div>
        </div>

        {/* Map Section */}
        <div className="container">
          <div className={styles.mapSection}>
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1m3!1d3834.110435400492!2d108.21160351112443!3d16.05925348455122!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x314219b45e2ba7df%3A0xc3b0928e4e94b2bd!2zOTggTMOqIMSQw6xuaCBMw70sIFbĩnhIFRydW5nLCBUaGFuaCBLaMOqLCDEkMOgIE7hurVuZywgVmlldG5hbQ!5e0!3m2!1sen!2s!4v1709628114138!5m2!1sen!2s" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={false} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>
    </div>
  );
}
