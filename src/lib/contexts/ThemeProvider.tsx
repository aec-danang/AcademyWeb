"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { SeasonalDecorations } from "@/components/seasonal-theme/SeasonalDecorations";
import { isSeasonalTheme, seasonalEffectsStorageKey, type SeasonalTheme } from "@/lib/seasonalTheme";

type Theme = "light" | "dark";
type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
  seasonalTheme: SeasonalTheme;
  setSeasonalTheme: (theme: SeasonalTheme) => Promise<void>;
  canManageTheme: boolean;
  savingTheme: boolean;
  themeError: string;
  effectsEnabled: boolean;
  setEffectsEnabled: (enabled: boolean) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const changeEvent = "aec-appearance-change";
type Props = { children: React.ReactNode; decorations?: boolean; initialSeasonalTheme?: SeasonalTheme };

export function ThemeProvider(props: Props) {
  // Legacy workspace layouts share the root controller rather than polling twice.
  const parent = useContext(ThemeContext);
  return parent ? <>{props.children}</> : <SiteThemeProvider {...props} />;
}

function SiteThemeProvider({ children, decorations = true, initialSeasonalTheme = "default" }: Props) {
  const [theme, setTheme] = useState<Theme>("light");
  const [seasonalTheme, setSeasonalState] = useState<SeasonalTheme>(initialSeasonalTheme);
  const [effectsEnabled, setEffectsState] = useState(true);
  const [canManageTheme, setCanManageTheme] = useState(false);
  const [savingTheme, setSavingTheme] = useState(false);
  const [themeError, setThemeError] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    const sync = () => {
      const color = localStorage.getItem("aec-theme") === "dark" ? "dark" : "light";
      const effects = localStorage.getItem(seasonalEffectsStorageKey) !== "false";
      setTheme(color); setEffectsState(effects);
      document.documentElement.classList.toggle("dark", color === "dark");
      document.documentElement.dataset.seasonalEffects = String(effects);
    };
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(changeEvent, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(changeEvent, sync);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const refresh = async () => {
      if (document.hidden) return;
      try {
        const response = await fetch("/api/site-theme", { cache: "no-store", signal: controller.signal });
        if (!response.ok) return;
        const config = await response.json();
        if (isSeasonalTheme(config.theme)) setSeasonalState(config.theme);
        setCanManageTheme(config.canManage === true);
      } catch { /* Retain the server-rendered appearance on transient network errors. */ }
    };
    void refresh();
    const interval = window.setInterval(() => void refresh(), 60_000);
    window.addEventListener("focus", refresh);
    return () => {
      controller.abort(); window.clearInterval(interval);
      window.removeEventListener("focus", refresh);
    };
  }, [pathname]);

  useEffect(() => { document.documentElement.dataset.seasonalTheme = seasonalTheme; }, [seasonalTheme]);

  const toggleTheme = () => {
    localStorage.setItem("aec-theme", theme === "dark" ? "light" : "dark");
    window.dispatchEvent(new Event(changeEvent));
  };

  const setSeasonalTheme = async (nextTheme: SeasonalTheme) => {
    if (!canManageTheme || savingTheme) return;
    setSavingTheme(true); setThemeError("");
    try {
      const response = await fetch("/api/site-theme", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: nextTheme }),
      });
      const config = await response.json();
      if (!response.ok || !isSeasonalTheme(config.theme)) {
        if (response.status === 403) setCanManageTheme(false);
        throw new Error(config.error || "Không lưu được chủ đề.");
      }
      setSeasonalState(config.theme);
    } catch (error) { setThemeError(error instanceof Error ? error.message : "Không lưu được chủ đề."); }
    finally { setSavingTheme(false); }
  };

  const setEffectsEnabled = (enabled: boolean) => {
    localStorage.setItem(seasonalEffectsStorageKey, String(enabled));
    window.dispatchEvent(new Event(changeEvent));
  };

  return <ThemeContext.Provider value={{ theme, toggleTheme, seasonalTheme, setSeasonalTheme, canManageTheme, savingTheme, themeError, effectsEnabled, setEffectsEnabled }}>
    {children}
    {decorations && <SeasonalDecorations theme={seasonalTheme} effectsEnabled={effectsEnabled} />}
  </ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
}
