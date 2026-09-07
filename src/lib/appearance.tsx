/**
 * Runtime UI customisation. The academy can restyle the dark skin and the
 * light skin independently; the values are stored with the rest of the data
 * and applied as CSS variables on <html>, so every screen follows instantly.
 */
import { useEffect } from "react";
import { useDB } from "@/lib/data-store";
import { useTheme } from "@/lib/theme";

export type Skin = {
  accent: string;
  background: string;
  surface: string;
  text: string;
};

export type Appearance = {
  dark: Skin;
  light: Skin;
  /** corner radius in px */
  radius: number;
  /** base font size in px (interface density) */
  fontSize: number;
  /** show the diagonal court texture behind headers */
  texture: boolean;
};

export const defaultAppearance: Appearance = {
  dark: { accent: "#2ec8bb", background: "#0e1b21", surface: "#16262d", text: "#e7f0f2" },
  light: { accent: "#127d75", background: "#f3f7f7", surface: "#ffffff", text: "#16262c" },
  radius: 8,
  fontSize: 16,
  texture: true,
};

function toRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = Number.parseInt(full.padEnd(6, "0").slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function toHex(rgb: [number, number, number]) {
  return `#${rgb.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("")}`;
}

/** amount = 0 keeps a, 1 returns b */
export function mix(a: string, b: string, amount: number) {
  const [r1, g1, b1] = toRgb(a);
  const [r2, g2, b2] = toRgb(b);
  return toHex([
    r1 + (r2 - r1) * amount,
    g1 + (g2 - g1) * amount,
    b1 + (b2 - b1) * amount,
  ]);
}

function readable(color: string) {
  const [r, g, b] = toRgb(color);
  const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luma > 0.6 ? "#0b1418" : "#ffffff";
}

/** Turns a skin into the full token set the design system consumes. */
export function skinVars(skin: Skin): Record<string, string> {
  const { accent, background, surface, text } = skin;
  return {
    "--ink-950": background,
    "--ink-900": surface,
    "--ink-850": mix(surface, text, 0.06),
    "--ink-800": mix(surface, text, 0.14),
    "--ink-700": mix(surface, text, 0.24),
    "--ink-400": mix(text, surface, 0.45),
    "--ink-300": mix(text, surface, 0.28),
    "--ink-200": mix(text, surface, 0.14),
    "--ink-100": text,
    "--court-600": mix(accent, "#000000", 0.18),
    "--court-500": accent,
    "--court-400": mix(accent, "#ffffff", 0.18),
    "--primary-foreground": readable(accent),
  };
}

export function applyAppearance(appearance: Appearance, theme: "dark" | "light") {
  const root = document.documentElement;
  const vars = skinVars(theme === "light" ? appearance.light : appearance.dark);
  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
  root.style.setProperty("--radius", `${appearance.radius}px`);
  root.style.fontSize = `${appearance.fontSize}px`;
  root.dataset["texture"] = appearance.texture ? "on" : "off";
}

/** Mounted once inside the data provider — keeps <html> in sync. */
export function AppearanceSync() {
  const { db, ready } = useDB();
  const { theme } = useTheme();
  const appearance = db.appearance ?? defaultAppearance;

  useEffect(() => {
    if (!ready) return;
    applyAppearance(appearance, theme);
  }, [appearance, theme, ready]);

  return null;
}
