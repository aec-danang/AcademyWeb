"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail } from "lucide-react";
import { FaFacebook, FaYoutube, FaInstagram } from "react-icons/fa";
import styles from "./Footer.module.css";

export default function Footer() {
  const partners = [
    { name: "FPT", url: "https://logo.clearbit.com/fpt.com.vn" },
    { name: "Bách Khoa", url: "https://logo.clearbit.com/dut.udn.vn" },
    { name: "Kinh Tế", url: "https://logo.clearbit.com/due.udn.vn" },
    { name: "VNPT", url: "https://logo.clearbit.com/vnpt.vn" },
    { name: "Viettel", url: "https://logo.clearbit.com/viettel.com.vn" },
    { name: "DOOSAN", url: "https://logo.clearbit.com/doosan.com" },
    { name: "LIXIL", url: "https://logo.clearbit.com/lixil.com" },
    { name: "mobifone", url: "https://logo.clearbit.com/mobifone.vn" },
    { name: "ABBANK", url: "https://logo.clearbit.com/abbank.vn" },
    { name: "Heineken", url: "https://logo.clearbit.com/heineken.com" },
    { name: "EVN", url: "https://logo.clearbit.com/evn.com.vn" }
  ];

  return (
    <>
      <section className={styles.partnersSection}>
        <div className="container">
          <h2 className={styles.partnersTitle}>ĐỐI TÁC ĐÀO TẠO VÀ KHẢO THÍ CỦA ACADEMY AEC</h2>
          <div className={styles.partnersGrid}>
            {partners.map((partner, index) => (
              <div key={index} className={styles.partnerLogo} title={partner.name}>
                <img 
                  suppressHydrationWarning
                  src={partner.url} 
                  alt={`${partner.name} logo`}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  onError={(e) => {
                    e.currentTarget.src = `https://placehold.co/120x60/ffffff/ff7a00?text=${encodeURIComponent(partner.name)}`;
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
      <div className="container">
        <div className={styles.footerTop}>
          <div>
            <Link href="/" className={styles.logo}>
              <Image src="/logos/aec/aec-logo-reverse-horizontal.png" alt="AEC Academy Logo" width={180} height={48} style={{ objectFit: 'contain' }} />
            </Link>
            <p className={styles.aboutText}>
              Educating people through English so they become successful global citizens responsible toward themselves and the community.
            </p>
            <div className={styles.contactItem}>
              <span className={styles.icon}><MapPin size={18} /></span>
              <span>98 Le Dinh Ly St, Da Nang</span>
            </div>
            <div className={styles.contactItem}>
              <span className={styles.icon}><Phone size={18} /></span>
              <span>(0236) 123 4567</span>
            </div>
            <div className={styles.contactItem}>
              <span className={styles.icon}><Mail size={18} /></span>
              <span>info@academy.edu.vn</span>
            </div>
          </div>
          
          <div>
            <h4 className={styles.title}>Quick Links</h4>
            <ul className={styles.links}>
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/#teachers">Our Teachers</Link></li>
              <li><Link href="/contact">Contact Us</Link></li>
              <li><Link href="/contact#register">Placement Test</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className={styles.title}>Programs</h4>
            <ul className={styles.links}>
              <li><Link href="/programs#kids">Kids & Teens</Link></li>
              <li><Link href="/programs#ielts">IELTS & Test Prep</Link></li>
              <li><Link href="/programs#adults">Adult Learners</Link></li>
              <li><Link href="/programs#corporate">Corporate English</Link></li>
            </ul>
          </div>

          <div>
            <h4 className={styles.title}>Newsletter</h4>
            <p className={styles.aboutText} style={{ marginBottom: "16px" }}>
              Subscribe to get the latest news and offers.
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
              <input 
                type="email" 
                placeholder="Your email" 
                style={{
                  padding: "10px 16px",
                  borderRadius: "999px",
                  border: "none",
                  width: "100%",
                  outline: "none"
                }}
              />
              <button className="btn-primary" style={{ padding: "10px 20px" }}>
                Send
              </button>
            </div>
          </div>
        </div>
        
        <div className={styles.footerBottom}>
          <p>&copy; {new Date().getFullYear()} Academy English Center. All rights reserved.</p>
          <div className={styles.socials}>
            <a href="https://www.facebook.com/trungtam.anhngu.academy/" aria-label="Facebook" target="_blank" rel="noopener noreferrer"><FaFacebook size={18} /></a>
            <a href="https://www.youtube.com/@academyenglishcenter4309/" aria-label="YouTube" target="_blank" rel="noopener noreferrer"><FaYoutube size={18} /></a>
            <a href="https://www.instagram.com/academyaec.dn/" aria-label="Instagram" target="_blank" rel="noopener noreferrer"><FaInstagram size={18} /></a>
          </div>
        </div>
      </div>
    </footer>
    </>
  );
}
