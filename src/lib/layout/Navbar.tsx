"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Sparkles } from "lucide-react";
import { SeasonalThemeMenu } from "@/components/seasonal-theme/SeasonalThemeMenu";
import { useTheme } from "@/lib/contexts/ThemeProvider";
import { PumpkinBadge } from "@/components/seasonal-theme/HalloweenScene";
import publicStyles from "@/components/seasonal-theme/PublicHalloween.module.css";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { effectsEnabled, setEffectsEnabled } = useTheme();
  const effectsToggle = <button type="button" className={publicStyles.effects} aria-pressed={effectsEnabled} onClick={() => setEffectsEnabled(!effectsEnabled)} title={effectsEnabled ? "Tắt chuyển động trang trí" : "Bật chuyển động trang trí"}><Sparkles size={14} aria-hidden="true" /><span>Hiệu ứng Halloween</span><span aria-hidden="true">{effectsEnabled ? "●" : "○"}</span></button>;

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMenuOpen]);

  const navItems = [
    { href: "/programs", label: "Chương trình" },
    { href: "/news", label: "Tin tức & Sự kiện" },
    { href: "/posts", label: "Blog" },
    { href: "/contact", label: "Liên hệ" },
  ];

  return (
    <header className="sticky top-0 left-0 right-0 z-50 bg-card py-4 border-b border-border shadow-sm">
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="relative z-50 flex shrink-0 items-center" onClick={() => setIsMenuOpen(false)}>
          <Image
            src="/aec/aec-logo-horizontal.png"
            alt="AEC Academy Logo"
            width={180}
            height={48}
            className="object-contain"
            style={{ width: 180, height: "auto", maxWidth: "100%" }}
          />
          <span className={publicStyles.logoBadge}><PumpkinBadge /></span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden xl:flex items-center gap-4" aria-label="Điều hướng chính">
          <ul className="flex items-center gap-5">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-[var(--aec-navy)] font-semibold text-[15px] hover:text-[var(--aec-orange)] transition-colors duration-300 relative group py-2"
                >
                  {item.label}
                  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[var(--aec-orange)] transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/login" className="btn-primary ml-2 shadow-sm hover:shadow-md transition-shadow">
            Đăng nhập
          </Link>
          <SeasonalThemeMenu />
          {effectsToggle}
        </nav>

        {/* Mobile Menu Toggle */}
        <div className="flex items-center gap-1 xl:hidden"><SeasonalThemeMenu /><button
          className="xl:hidden relative z-50 p-2 text-navy hover:text-orange transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "Đóng menu" : "Mở menu"}
          aria-expanded={isMenuOpen}
          aria-controls="public-mobile-menu"
        >
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button></div>

        {/* Mobile Navigation */}
        <div
          id="public-mobile-menu"
          inert={!isMenuOpen}
          aria-hidden={!isMenuOpen}
          className={`fixed inset-0 bg-card z-40 flex flex-col overflow-y-auto pt-24 px-6 transition-transform duration-300 ease-in-out xl:hidden ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <ul className="flex flex-col gap-4 text-center mt-8">
            <li className="flex justify-center">{effectsToggle}</li>
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-[var(--aec-navy)] font-semibold text-xl py-3 hover:text-[var(--aec-orange)] transition-colors duration-300 block"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="mt-8 pt-8 border-t border-gray-100">
              <Link
                href="/login"
                className="btn-primary w-full justify-center py-4 text-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                Đăng nhập
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
