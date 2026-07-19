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

export default function ContactPageClient({ programs }: { programs: any[] }) {
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
  }, { scope: containerRef });

  return (
    <div ref={containerRef}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroBackground}></div>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>Liên Hệ</div>
          <h1 className={styles.heroTitle}>Kết nối với chúng tôi</h1>
          <p style={{ fontSize: "var(--text-lg)", color: "#aeb0cc", lineHeight: 1.6 }}>
            Bạn có thắc mắc về các chương trình học hoặc muốn đăng ký thi xếp lớp? Chúng tôi luôn sẵn sàng hỗ trợ!
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className={styles.mainContent}>
        <div className={styles.contentWrapper}>
          
          {/* Contact Information Column */}
          <div className={styles.infoColumn}>
            <div className={styles.infoCard}>
              <h2 className={styles.infoTitle}>Thông tin liên hệ</h2>
              <div className={styles.contactList}>
                <div className={styles.contactItem}>
                  <div className={styles.iconWrapper}>
                    <MapPin size={24} />
                  </div>
                  <div className={styles.itemDetails}>
                    <h4>Địa chỉ</h4>
                    <p>98 Lê Đình Lý, Đà Nẵng</p>
                  </div>
                </div>
                
                <div className={styles.contactItem}>
                  <div className={styles.iconWrapper}>
                    <Phone size={24} />
                  </div>
                  <div className={styles.itemDetails}>
                    <h4>Điện thoại</h4>
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
                    <h4>Giờ làm việc</h4>
                    <p>Thứ 2 - CN: 8:00 - 21:00</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Registration Form Column */}
          <div id="register" className={styles.formCard}>
            <h2 className={styles.formTitle}>Đăng ký thi xếp lớp</h2>
            <p className={styles.formSubtitle}>Vui lòng điền vào biểu mẫu dưới đây và các tư vấn viên của chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.</p>
            <ContactFormClient programs={programs} />
          </div>
        </div>
      </section>
    </div>
  );
}
