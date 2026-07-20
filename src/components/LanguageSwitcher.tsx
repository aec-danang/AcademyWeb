"use client";

import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = useLocale();

  const isVi = currentLocale === 'vi';

  const handleLanguageChange = () => {
    const newLocale = isVi ? 'en' : 'vi';
    
    // Replace the current locale in the pathname with the new one
    // e.g. /en/about -> /vi/about
    const newPath = pathname.replace(`/${currentLocale}`, `/${newLocale}`);
    
    // Fallback if pathname doesn't contain the locale for some reason
    const finalPath = newPath === pathname ? `/${newLocale}${pathname}` : newPath;
    
    router.push(finalPath);
    router.refresh();
  };

  const knobRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const flagContentRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Animate the knob sliding
    gsap.to(knobRef.current, {
      x: isVi ? 24 : -24,
      duration: 0.5,
      ease: "power3.out",
    });

    // Animate the text fading
    gsap.fromTo(textRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.3, delay: 0.1 }
    );

    // Animate the flag content to give a rolling/flipping effect
    gsap.fromTo(flagContentRef.current,
      { scale: 0.5, opacity: 0, rotation: isVi ? -90 : 90 },
      { scale: 1, opacity: 1, rotation: 0, duration: 0.5, ease: "back.out(1.5)" }
    );

  }, { dependencies: [isVi], scope: containerRef });

  return (
    <div 
      ref={containerRef}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#e2e8f0', // Soft light gray
        borderRadius: '30px',
        width: '86px',
        height: '40px',
        cursor: 'pointer',
        // Neumorphic inner shadow for the track
        boxShadow: 'inset 3px 3px 6px #cbd5e1, inset -3px -3px 6px #ffffff',
        position: 'relative',
        flexShrink: 0 // Prevent shrinking in the flex header
      }}
      onClick={handleLanguageChange}
      aria-label={isVi ? "Switch to English" : "Chuyển sang Tiếng Việt"}
      title={isVi ? "Switch to English" : "Chuyển sang Tiếng Việt"}
    >
      {/* Background Text (VN on the left, EN on the right) */}
      <span 
        ref={textRef}
        style={{ 
          position: 'absolute', 
          left: isVi ? '14px' : 'auto',
          right: isVi ? 'auto' : '14px',
          fontSize: '15px', 
          fontWeight: '700', 
          color: '#64748b', 
          pointerEvents: 'none',
          fontFamily: 'sans-serif'
        }}
      >
        {isVi ? 'VN' : 'EN'}
      </span>

      {/* Sliding Knob (The Flag) */}
      <div 
        ref={knobRef}
        style={{
          width: '32px',
          height: '32px',
          backgroundColor: '#fff',
          borderRadius: '50%',
          // Drop shadow to make it pop out of the track
          boxShadow: '2px 2px 5px rgba(0,0,0,0.2), -1px -1px 3px rgba(255,255,255,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'absolute',
          top: '50%',
          marginTop: '-16px', // perfectly center 32px height
          zIndex: 2,
          overflow: 'hidden'
        }}
      >
        <div 
          ref={flagContentRef}
          style={{ 
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* Using circular SVGs instead of emojis for consistent 3D look on Windows */}
          {isVi ? (
            <img src="https://hatscripts.github.io/circle-flags/flags/vn.svg" alt="VN Flag" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <img src="https://hatscripts.github.io/circle-flags/flags/us.svg" alt="US Flag" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          )}
        </div>
      </div>
    </div>
  );
}
