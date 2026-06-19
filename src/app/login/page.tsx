"use client";

import React, { useRef, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import styles from "./login.module.css";
import { ArrowLeft } from "lucide-react";

// Register the GSAP plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

function AuthContent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const isLogin = true;

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
          <h1 className={styles.title}>Đăng Nhập</h1>
          <p className={styles.subtitle}>Tài khoản học viên và giáo viên do quản trị viên tạo và phân quyền.</p>
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
              Vào Lớp Học
            </button>
          </form>
        </div>

        <div className={styles.formFooter}>
          Cần tạo tài khoản mới? <Link href="/contact#register" className={styles.switchLink}>Liên hệ trung tâm</Link>
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
