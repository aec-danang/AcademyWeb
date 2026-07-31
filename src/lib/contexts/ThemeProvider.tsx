"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    const storedTheme = localStorage.getItem("aec-theme") as Theme | null;
    const isManagement = pathname?.startsWith("/management");

    if (!isManagement) {
      setTheme("light");
      document.documentElement.classList.remove("dark");
    } else if (storedTheme) {
      setTheme(storedTheme);
      if (storedTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [pathname]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const isManagement = pathname?.startsWith("/management");
      const newTheme = prev === "light" ? "dark" : "light";
      localStorage.setItem("aec-theme", newTheme);
      
      if (isManagement) {
        if (newTheme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
      
      return newTheme;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme: mounted ? theme : "light", toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
