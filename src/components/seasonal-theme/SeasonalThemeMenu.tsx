"use client";

import { Check, Gift, MoonStar, Palette, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTheme } from "@/lib/contexts/ThemeProvider";
import { seasonalThemes } from "@/lib/seasonalTheme";

const icons = { default: Palette, halloween: MoonStar, christmas: Gift };

export function SeasonalThemeMenu() {
  const { seasonalTheme, setSeasonalTheme, effectsEnabled, setEffectsEnabled, canManageTheme, savingTheme, themeError } = useTheme();
  if (!canManageTheme) return null;
  const selected = seasonalThemes.find((item) => item.id === seasonalTheme) ?? seasonalThemes[0];
  const Icon = icons[seasonalTheme];
  return <DropdownMenu>
    <DropdownMenuTrigger asChild><Button variant="ghost" className="h-9 gap-2 px-2 text-slate-600 dark:text-slate-200" aria-label={`Chủ đề: ${selected.label}`} title="Chọn chủ đề sự kiện"><Icon className="h-5 w-5" /><span className="hidden text-xs font-semibold lg:inline">{selected.label}</span></Button></DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-60">
      <DropdownMenuLabel>Chủ đề toàn website · Admin</DropdownMenuLabel>
      {themeError && <p role="alert" className="px-2 text-xs text-red-600">{themeError}</p>}
      <DropdownMenuSeparator />
      {seasonalThemes.map((item) => { const OptionIcon = icons[item.id]; return <DropdownMenuItem key={item.id} disabled={savingTheme} onSelect={(event) => { event.preventDefault(); void setSeasonalTheme(item.id); }} className="flex cursor-pointer items-center gap-3 py-2"><OptionIcon className="h-4 w-4 shrink-0" /><span className="flex-1"><span className="block text-sm font-semibold">{item.label}</span><span className="block text-xs text-muted-foreground">{item.description}</span></span>{seasonalTheme === item.id && <Check className="h-4 w-4 text-primary" aria-label="Đang chọn" />}</DropdownMenuItem>; })}
      <DropdownMenuSeparator />
      <DropdownMenuCheckboxItem checked={effectsEnabled} onCheckedChange={(checked) => setEffectsEnabled(checked === true)} className="gap-2"><Sparkles className="h-4 w-4" /> Hiệu ứng chuyển động</DropdownMenuCheckboxItem>
    </DropdownMenuContent>
  </DropdownMenu>;
}
