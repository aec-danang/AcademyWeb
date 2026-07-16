"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLanguage = () => {
    const nextLocale = locale === "en" ? "vi" : "en";
    let newPathname = pathname;
    const isElearning = pathname.startsWith('/elearning') || pathname.startsWith('/en/elearning') || pathname.startsWith('/vi/elearning');
    
    const defaultLocale = isElearning ? 'en' : 'vi';
    
    // Strip existing locale prefix
    let strippedPath = pathname;
    if (pathname.startsWith('/en/') || pathname === '/en') {
      strippedPath = pathname.replace(/^\/en/, '');
    } else if (pathname.startsWith('/vi/') || pathname === '/vi') {
      strippedPath = pathname.replace(/^\/vi/, '');
    }
    if (strippedPath === '') strippedPath = '/';
    
    // Add the new locale prefix if it's not the default
    if (nextLocale === defaultLocale) {
      newPathname = strippedPath;
    } else {
      newPathname = `/${nextLocale}${strippedPath === '/' ? '' : strippedPath}`;
    }
    
    // Force the next-intl cookie to update so middleware doesn't override us
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000`;
    
    router.push(newPathname);
    // Refresh the router to ensure client components update translations
    router.refresh();
  };

  return (
    <Button 
      variant="ghost" 
      onClick={toggleLanguage} 
      className="w-full flex justify-start gap-2 h-auto py-2 px-3 text-muted-foreground hover:text-foreground hover:bg-muted/50 font-medium"
    >
      <Globe size={20} />
      <span>{locale === "en" ? "Tiếng Việt" : "English"}</span>
    </Button>
  );
}
