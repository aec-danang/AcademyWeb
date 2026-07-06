"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { BookOpen, Target, Clock, Trophy, ChevronRight } from "lucide-react";
import styles from "../elearning.module.css";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type PracticeTestCardProps = {
  test: {
    id: string;
    title: string;
    description: string | null;
    unit: string | null;
    program: { name: string } | null;
    _count: { questions: number };
  };
};

export default function PracticeTestList({ tests }: { tests: PracticeTestCardProps["test"][] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;
      const cards = gsap.utils.toArray<HTMLElement>(".gsap-test-card");

      // Antigravity Design: Set initial 3D state and spatial depth
      gsap.set(containerRef.current, { perspective: 1200 });
      gsap.set(cards, { y: 100, rotationX: 15, opacity: 0, scale: 0.95 });

      // Staggered entrances with buttery smooth motion
      gsap.to(cards, {
        y: 0,
        rotationX: 0,
        opacity: 1,
        scale: 1,
        duration: 1.2,
        stagger: 0.1,
        ease: "expo.out",
        overwrite: true,
        delay: 0.1,
      });
      
      // Floating hover effect for each card
      const enterListeners = new Map();
      const leaveListeners = new Map();

      cards.forEach(card => {
        const onEnter = () => {
          gsap.to(card, {
            y: -6,
            boxShadow: "0 20px 40px -10px rgba(79, 70, 229, 0.15), 0 10px 20px -5px rgba(0,0,0,0.05)",
            borderColor: "rgba(79, 70, 229, 0.4)",
            duration: 0.3,
            ease: "power2.out"
          });
        };
        const onLeave = () => {
          gsap.to(card, {
            y: 0,
            boxShadow: "0 10px 20px rgba(0,0,0,0.05)",
            borderColor: "rgba(255, 255, 255, 0.4)",
            duration: 0.4,
            ease: "power2.out"
          });
        };
        
        card.addEventListener('mouseenter', onEnter);
        card.addEventListener('mouseleave', onLeave);
        
        enterListeners.set(card, onEnter);
        leaveListeners.set(card, onLeave);
      });

      return () => {
        cards.forEach(card => {
          if (enterListeners.has(card)) card.removeEventListener('mouseenter', enterListeners.get(card));
          if (leaveListeners.has(card)) card.removeEventListener('mouseleave', leaveListeners.get(card));
        });
      };
    },
    { scope: containerRef }
  );

  if (tests.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 1rem", color: "var(--text-muted)" }}>
        <Target size={48} style={{ opacity: 0.2, marginBottom: "1rem" }} />
        <h3>Chưa có đề thi nào</h3>
        <p>Các đề thi luyện tập sẽ phù hợp với tìm kiếm của bạn không được tìm thấy.</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
        gap: "2rem",
        padding: "2rem 0",
      }}
    >
      {tests.map((test) => (
        <Link 
          key={test.id} 
          href={`/elearning/exercises/${test.id}`} 
          className="gsap-test-card"
          style={{
            display: "flex",
            flexDirection: "column",
            background: "rgba(255, 255, 255, 0.7)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(255, 255, 255, 0.4)",
            borderRadius: "1.5rem",
            padding: "1.5rem",
            textDecoration: "none",
            color: "inherit",
            boxShadow: "0 10px 20px rgba(0,0,0,0.05)",
            transformStyle: "preserve-3d",
            willChange: "transform, box-shadow",
            position: "relative",
            overflow: "hidden",
            minHeight: "220px"
          }}
        >
          {/* Decorative glowing orb for spatial depth */}
          <div style={{ position: "absolute", top: "-20%", right: "-20%", width: "120px", height: "120px", background: "var(--brand-primary, #4f46e5)", filter: "blur(60px)", opacity: 0.15, borderRadius: "50%", pointerEvents: "none" }}></div>

          <div style={{ flex: 1, zIndex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <span style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "var(--brand-primary, #4f46e5)",
                background: "rgba(79, 70, 229, 0.1)",
                padding: "0.25rem 0.75rem",
                borderRadius: "999px"
              }}>
                {test.program ? test.program.name : "Practice Test"}
                {test.unit ? ` • Unit ${test.unit}` : ""}
              </span>
              
              <span style={{
                fontSize: "0.7rem",
                fontWeight: 700,
                textTransform: "uppercase",
                background: "#10b981",
                color: "white",
                padding: "0.2rem 0.5rem",
                borderRadius: "0.5rem",
                boxShadow: "0 4px 10px rgba(16, 185, 129, 0.3)"
              }}>Mới</span>
            </div>
            
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, margin: "0 0 0.5rem 0", lineHeight: 1.3 }}>{test.title}</h3>
            
            {test.description && (
              <div style={{ 
                color: "var(--text-muted, #6b7280)", 
                fontSize: "0.875rem", 
                display: "-webkit-box", 
                WebkitLineClamp: 2, 
                WebkitBoxOrient: "vertical", 
                overflow: "hidden",
                marginBottom: "1.5rem"
              }}>
                {test.description}
              </div>
            )}
          </div>

          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            marginTop: "auto", 
            paddingTop: "1rem", 
            borderTop: "1px solid rgba(0,0,0,0.06)",
            zIndex: 1
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted, #6b7280)", fontSize: "0.875rem", fontWeight: 600 }}>
              <div style={{ background: "rgba(0,0,0,0.04)", padding: "0.4rem", borderRadius: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                 <BookOpen size={16} />
              </div>
              <span>{test._count.questions} questions</span>
            </div>
            
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
              color: "var(--brand-primary, #4f46e5)",
              fontWeight: 600,
              fontSize: "0.875rem"
            }}>
              Vào Thi <ChevronRight size={16} />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
