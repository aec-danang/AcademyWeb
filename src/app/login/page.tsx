"use client";

import React, { useRef, useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import styles from "./login.module.css";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { ArrowLeft } from "lucide-react";

// Register the GSAP plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

function AuthContent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const searchParams = useSearchParams();
  
  // Set initial state based on URL search param ?mode=register
  const modeParam = searchParams.get("mode");
  const [isLogin, setIsLogin] = useState(modeParam !== "register");

  // Sync state if URL changes dynamically without reload
  useEffect(() => {
    if (modeParam === "register" && isLogin) {
      setIsLogin(false);
    } else if (modeParam !== "register" && !isLogin) {
      setIsLogin(true);
    }
  }, [modeParam]);

  // Initial load animation
  useGSAP(
    () => {
      const tl = gsap.timeline();
      tl.from(`.${styles.loginCard}`, {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: "power4.out",
      });
      tl.from(`.${styles.logoContainer}`, {
        scale: 0.8,
        opacity: 0,
        duration: 0.8,
        ease: "back.out(1.5)",
      }, "-=0.6");
      tl.from([`.${styles.headerText}`, `.${styles.formContainer}`, `.${styles.divider}`, `.${styles.socialButtons}`, `.${styles.formFooter}`, `.${styles.backHome}`], {
        y: 20,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power4.out",
      }, "-=0.4");
    },
    { scope: containerRef }
  );

  // Form switch animation using contextSafe
  const { contextSafe } = useGSAP({ scope: containerRef });

  const toggleAuthMode = contextSafe(() => {
    const outX = isLogin ? -20 : 20;
    const inX = isLogin ? 20 : -20;

    gsap.to(`.${styles.formContainer}, .${styles.headerText} h1, .${styles.headerText} p`, {
      opacity: 0,
      x: outX,
      duration: 0.2,
      ease: "power2.in",
      onComplete: () => {
        setIsLogin(!isLogin);
        
        gsap.fromTo(`.${styles.formContainer}`, 
          { opacity: 0, x: inX },
          { opacity: 1, x: 0, duration: 0.4, ease: "power3.out" }
        );
        gsap.fromTo(`.${styles.headerText} h1, .${styles.headerText} p`,
          { opacity: 0, y: -10, x: 0 },
          { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: "power3.out" }
        );
      }
    });
  });

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={styles.loginCard}>
        <Link href="/" className={styles.backHome}>
          <ArrowLeft size={16} strokeWidth={2.5} />
          Trang chủ
        </Link>

        <div className={styles.logoContainer}>
          <Image
            src="/logos/aec/aec-logo-vertical.png"
            alt="AEC Logo"
            width={140}
            height={140}
            className={styles.logoImage}
            priority
          />
        </div>

        <div className={styles.headerText}>
          <h1 className={styles.title}>{isLogin ? "Đăng Nhập" : "Đăng Ký"}</h1>
          <p className={styles.subtitle}>
            {isLogin 
              ? "Chào mừng bạn quay lại Hệ thống Học tập AEC!" 
              : "Tạo tài khoản để trải nghiệm các khóa học chuẩn quốc tế."}
          </p>
        </div>

        <div className={styles.formContainer}>
          <form className={styles.form} ref={formRef} onSubmit={(e) => e.preventDefault()}>
            {!isLogin && (
              <div className={styles.inputGroup}>
                <label htmlFor="name" className={styles.label}>Họ và tên</label>
                <input type="text" id="name" className={styles.input} placeholder="Nguyễn Văn A" required />
              </div>
            )}
            
            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>Email</label>
              <input type="email" id="email" className={styles.input} placeholder="nhap.email@example.com" required />
            </div>

            {!isLogin && (
              <div className={styles.inputGroup}>
                <label htmlFor="phone" className={styles.label}>Số điện thoại</label>
                <input type="tel" id="phone" className={styles.input} placeholder="0901234567" required />
              </div>
            )}

            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>Mật khẩu</label>
              <input type="password" id="password" className={styles.input} placeholder="••••••••" required />
            </div>

            {!isLogin && (
              <div className={styles.inputGroup}>
                <label htmlFor="confirmPassword" className={styles.label}>Xác nhận mật khẩu</label>
                <input type="password" id="confirmPassword" className={styles.input} placeholder="••••••••" required />
              </div>
            )}

            {isLogin && (
              <div className={styles.forgotPassword}>
                Quên mật khẩu?
              </div>
            )}

            <button type="submit" className={`btn-primary ${styles.submitBtn}`}>
              {isLogin ? "Vào Lớp Học" : "Đăng Ký Ngay"}
            </button>
          </form>
        </div>

        <div className={styles.divider}>Hoặc tiếp tục với</div>

        <div className={styles.socialButtons}>
          <button type="button" className={styles.btnSocial}>
            <FcGoogle size={20} />
            Google
          </button>
          <button type="button" className={styles.btnSocial}>
            <FaFacebook size={20} color="#1877F2" />
            Facebook
          </button>
        </div>

        <div className={styles.formFooter}>
          {isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản?"}
          <span className={styles.switchLink} onClick={toggleAuthMode}>
            {isLogin ? "Đăng ký ngay" : "Đăng nhập"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Đang tải...</div>}>
      <AuthContent />
    </Suspense>
  );
}
