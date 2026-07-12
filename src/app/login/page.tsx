"use client";

import React, { useRef, Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import styles from "./login.module.css";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

// Register the GSAP plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

function AuthContent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const isLogin = true;

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        identifier,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Tài khoản hoặc mật khẩu không chính xác");
        setIsLoading(false);
        return;
      }

      if (res?.ok) {
        const sessionRes = await fetch("/api/auth/session");
        const session = await sessionRes.json();
        
        if (session?.user?.role === "ADMIN") {
          router.push("/management");
        } else {
          router.push("/elearning");
        }
      }
    } catch (err) {
      setError("Đã xảy ra lỗi, vui lòng thử lại sau.");
      setIsLoading(false);
    }
  };

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
      <style dangerouslySetInnerHTML={{ __html: `body { overflow: hidden; }` }} />
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
          {error && <div style={{ color: "var(--color-orange)", marginBottom: "1rem", fontSize: "0.9rem", textAlign: "center" }}>{error}</div>}
          <form className={styles.form} ref={formRef} onSubmit={handleLogin}>
            {!isLogin && (
              <div className={styles.inputGroup}>
                <label htmlFor="name" className={styles.label}>Họ và tên</label>
                <input type="text" id="name" className={styles.input} placeholder="Nguyễn Văn A" required />
              </div>
            )}
            
            <div className={styles.inputGroup}>
              <label htmlFor="identifier" className={styles.label}>Email hoặc Tên đăng nhập</label>
              <input 
                type="text" 
                id="identifier" 
                className={styles.input} 
                placeholder="Email hoặc Tên đăng nhập" 
                required 
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {!isLogin && (
              <div className={styles.inputGroup}>
                <label htmlFor="phone" className={styles.label}>Số điện thoại</label>
                <input type="tel" id="phone" className={styles.input} placeholder="0901234567" required />
              </div>
            )}

            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>Mật khẩu</label>
              <div style={{ position: "relative" }}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="password" 
                  className={styles.input} 
                  placeholder="••••••••" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  style={{ paddingRight: "40px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex", alignItems: "center", padding: 0 }}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
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

            <button type="submit" className={`btn-primary ${styles.submitBtn}`} disabled={isLoading}>
              {isLoading ? "Đang xử lý..." : "Đăng Nhập"}
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
