"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    <header className="sticky top-0 left-0 right-0 z-50 bg-white py-4 border-b border-gray-100/50 shadow-sm">
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="relative z-50 flex items-center" onClick={() => setIsMenuOpen(false)}>
          <Image
            src="/logos/aec/aec-logo-horizontal.png"
            alt="AEC Academy Logo"
            width={180}
            height={48}
            className="object-contain w-auto h-10 md:h-12"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-10">
          <ul className="flex items-center gap-8">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-[#2c2d65] font-semibold text-[15px] hover:text-[#f68d2e] transition-colors duration-300 relative group py-2"
                >
                  {item.label}
                  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#f68d2e] transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/login" className="btn-primary ml-2 shadow-sm hover:shadow-md transition-shadow">
            Đăng nhập
          </Link>
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          className="lg:hidden relative z-50 p-2 text-navy hover:text-orange transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "Đóng menu" : "Mở menu"}
        >
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Mobile Navigation */}
        <div
          className={`fixed inset-0 bg-white z-40 flex flex-col pt-24 px-6 transition-transform duration-300 ease-in-out lg:hidden ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <ul className="flex flex-col gap-4 text-center mt-8">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-[#2c2d65] font-semibold text-xl py-3 hover:text-[#f68d2e] transition-colors duration-300 block"
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
