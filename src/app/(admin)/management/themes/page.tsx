"use client";

import { Check, Gift, MoonStar, Palette, Sparkles } from "lucide-react";
import { AdminPageHeader } from "../AdminPageHeader";
import { useTheme } from "@/lib/contexts/ThemeProvider";
import { seasonalThemes } from "@/lib/seasonalTheme";
import { Switch } from "@/components/ui/switch";

const presentation = {
  default: { icon: Palette, surface: "bg-[#fef4eb]", ink: "text-[#2c2d65]", accent: "bg-[#f68d2e]" },
  halloween: { icon: MoonStar, surface: "bg-[#f3eafa]", ink: "text-[#39205e]", accent: "bg-[#ab5b0c]" },
  christmas: { icon: Gift, surface: "bg-[#e7f4ee]", ink: "text-[#174a37]", accent: "bg-[#be233b]" },
} as const;

export default function ThemesPage() {
  const { seasonalTheme, setSeasonalTheme, effectsEnabled, setEffectsEnabled, canManageTheme, savingTheme, themeError } = useTheme();
  return <div className="mx-auto max-w-6xl space-y-6">
    <AdminPageHeader eyebrow="Cấu hình website · Admin" title="Chủ đề sự kiện" description="Admin áp dụng chủ đề chung cho toàn website. Khách truy cập có thể tự tắt chuyển động trên thiết bị của mình." />
    {!canManageTheme && <p role="status" className="rounded-xl border p-4 text-sm">Cần đăng nhập tài khoản admin thật để lưu chủ đề. Vai trò demo không có quyền thay đổi website.</p>}
    {themeError && <p role="alert" className="text-sm text-red-600">{themeError}</p>}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {seasonalThemes.map((item) => { const preview = presentation[item.id]; const Icon = preview.icon; const active = seasonalTheme === item.id; return <article key={item.id} className={`overflow-hidden rounded-xl border bg-card shadow-sm ${active ? "border-primary ring-2 ring-primary/30" : "border-border"}`}>
        <div className={`flex h-36 items-center justify-center ${preview.surface}`}><div className={`relative flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-sm ${preview.ink}`}><Icon className="h-10 w-10" /><span className={`absolute -bottom-2 h-2 w-12 rounded-full ${preview.accent}`} /></div></div>
        <div className="flex items-center justify-between gap-3 p-4"><div><h2 className="font-bold text-card-foreground">{item.label}</h2><p className="mt-1 text-xs text-muted-foreground">{item.description}</p></div><button type="button" disabled={!canManageTheme || savingTheme} onClick={() => void setSeasonalTheme(item.id)} aria-pressed={active} className={`inline-flex min-w-28 items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${active ? "bg-primary text-primary-foreground" : "border border-border bg-background text-foreground hover:bg-accent"}`}>{active ? <><Check className="h-3.5 w-3.5" /> Đang dùng</> : "Áp dụng"}</button></div>
      </article>; })}
    </div>
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4"><div className="flex items-start gap-3"><Sparkles className="mt-0.5 h-5 w-5 text-primary" /><div><h2 className="text-sm font-bold text-card-foreground">Hiệu ứng chuyển động</h2><p className="mt-1 text-xs text-muted-foreground">Tắt tuyết và các trang trí chuyển động. Cài đặt giảm chuyển động của thiết bị luôn được ưu tiên.</p></div></div><Switch checked={effectsEnabled} onCheckedChange={setEffectsEnabled} aria-label="Bật hoặc tắt hiệu ứng chủ đề" /></div>
  </div>;
}
