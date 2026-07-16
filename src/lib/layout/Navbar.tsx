"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { href: "/programs", label: "Chương trình" },
    { href: "/about", label: "Giới thiệu" },
    { href: "/teachers", label: "Giáo viên" },
    { href: "/contact", label: "Liên hệ" },
  ];

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
      <div className={`container ${styles.navContainer}`}>
        <Link href="/" className={styles.logo}>
          <Image src="/logos/aec/aec-logo-horizontal.png" alt="AEC Academy Logo" width={180} height={48} style={{ objectFit: 'contain', width: 'auto', height: 'auto' }} />
        </Link>
        
        <button className={styles.menuToggle} onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X /> : <Menu />}
        </button>

        <nav className={`${styles.nav} ${isMenuOpen ? styles.open : ""}`}>
          <ul className={styles.navLinks}>
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={styles.navLink} onClick={() => setIsMenuOpen(false)}>
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/login" className="btn-primary" style={{ padding: "8px 16px", borderRadius: "8px" }}>
                Đăng nhập
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
