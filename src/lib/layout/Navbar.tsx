"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import styles from "./Navbar.module.css";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations("Navbar");

  return (
    <header className={styles.header}>
      <div className={`container ${styles.navContainer}`}>
        <Link href="/" className={styles.logo} onClick={() => setIsOpen(false)}>
          <Image src="/logos/aec/aec-logo-horizontal.png" alt="AEC Academy Logo" width={180} height={48} style={{ objectFit: 'contain', width: 'auto', height: 'auto' }} />
        </Link>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <nav className={`${styles.nav} ${isOpen ? styles.navOpen : ''}`}>
            <ul className={styles.navLinks}>
              <li><Link href="/programs" className={styles.navLink} onClick={() => setIsOpen(false)}>{t('programs')}</Link></li>
              <li><Link href="/about" className={styles.navLink} onClick={() => setIsOpen(false)}>{t('about')}</Link></li>
              <li><Link href="/teachers" className={styles.navLink} onClick={() => setIsOpen(false)}>{t('teachers')}</Link></li>
              <li><Link href="/contact" className={styles.navLink} onClick={() => setIsOpen(false)}>{t('contact')}</Link></li>
              <li>
                <Link href="/login" className="btn-primary" style={{ padding: "8px 16px", borderRadius: "8px" }} onClick={() => setIsOpen(false)}>
                  {t('login')}
                </Link>
              </li>
            </ul>
          </nav>

          <LanguageSwitcher />

          <button 
            className={styles.mobileToggle}
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </header>
  );
}
