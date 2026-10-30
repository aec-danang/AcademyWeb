export type SeasonalTheme = "default" | "halloween" | "christmas";

export const seasonalThemes = [
  { id: "default", label: "Mặc định", description: "Cam và navy AEC" },
  { id: "halloween", label: "Halloween", description: "Cam, tím và bí ngô" },
  { id: "christmas", label: "Giáng sinh", description: "Đỏ, xanh lá và tuyết" },
] as const;

export const seasonalThemeStorageKey = "aec-seasonal-theme";
export const seasonalEffectsStorageKey = "aec-seasonal-effects";

export function isSeasonalTheme(value: unknown): value is SeasonalTheme {
  return value === "default" || value === "halloween" || value === "christmas";
}
