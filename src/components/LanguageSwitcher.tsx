"use client";

import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";

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

  return (
    <button 
      onClick={handleLanguageChange}
      style={{ 
        cursor: 'pointer', 
        background: 'none', 
        border: 'none', 
        padding: '0 8px',
        fontSize: '24px',
        lineHeight: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'transform 0.2s ease'
      }}
      aria-label={isVi ? "Switch to English" : "Chuyển sang Tiếng Việt"}
      title={isVi ? "Switch to English" : "Chuyển sang Tiếng Việt"}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
    >
      {isVi ? '🇬🇧' : '🇻🇳'}
    </button>
  );
}
