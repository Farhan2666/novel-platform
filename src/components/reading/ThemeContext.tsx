"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";

interface ThemeConfig {
  id: string;
  name: string;
  bg: string;
  text: string;
  texture?: string;
  isTexture: boolean;
}

const THEMES: ThemeConfig[] = [
  { id: "classic", name: "Klasik", bg: "#F4ECD8", text: "#2B2519", isTexture: false },
  { id: "dark", name: "Malam", bg: "#121212", text: "#E0E0E0", isTexture: false },
  { id: "mint", name: "Estetik Mint", bg: "#E8F5E9", text: "#263238", isTexture: false },
  { id: "pink", name: "Estetik Soft Pink", bg: "#FCE4EC", text: "#4A148C", isTexture: false },
  { id: "old-book", name: "Buku Tua", bg: "#F4ECD8", text: "#1F1A12", isTexture: true },
];

export const FONTS = [
  { id: "inter", name: "Inter", className: "font-inter", category: "Sans-serif" },
  { id: "atkinson", name: "Atkinson Hyperlegible", className: "font-atkinson", category: "Sans-serif" },
  { id: "literata", name: "Literata", className: "font-literata", category: "Serif" },
  { id: "merriweather", name: "Merriweather", className: "font-merriweather", category: "Serif" },
  { id: "lora", name: "Lora", className: "font-lora", category: "Serif" },
  { id: "georgia", name: "Georgia", className: "font-georgia", category: "Serif" },
];

const STORAGE_KEY = "novelnest-reading";

function loadPrefs() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function savePrefs(prefs: Record<string, any>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {}
}

interface ThemeContext {
  theme: ThemeConfig;
  themes: ThemeConfig[];
  fontScale: number;
  navMode: "scroll" | "flip";
  fontFamily: string;
  setTheme: (id: string) => void;
  setFontScale: (s: number) => void;
  setNavMode: (m: "scroll" | "flip") => void;
  setFontFamily: (f: string) => void;
}

const ThemeCtx = createContext<ThemeContext>({
  theme: THEMES[0],
  themes: THEMES,
  fontScale: 100,
  navMode: "scroll",
  fontFamily: "inter",
  setTheme: () => {},
  setFontScale: () => {},
  setNavMode: () => {},
  setFontFamily: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const saved = loadPrefs();
  const [themeId, setThemeId] = useState(saved?.themeId || "classic");
  const [fontScale, setFontScale] = useState(saved?.fontScale || 100);
  const [navMode, setNavMode] = useState<"scroll" | "flip">(saved?.navMode || "scroll");
  const [fontFamily, setFontFamily] = useState(saved?.fontFamily || "inter");

  const theme = THEMES.find((t) => t.id === themeId) || THEMES[0];

  useEffect(() => {
    document.documentElement.style.setProperty("--reading-bg", theme.bg);
    document.documentElement.style.setProperty("--reading-text", theme.text);
    document.documentElement.style.setProperty("--reading-font-scale", `${fontScale}%`);
  }, [theme, fontScale]);

  const handleSetTheme = useCallback((id: string) => {
    setThemeId(id);
    savePrefs({ themeId: id, fontScale, navMode, fontFamily });
  }, [fontScale, navMode, fontFamily]);

  const handleSetFontScale = useCallback((s: number) => {
    setFontScale(s);
    savePrefs({ themeId, fontScale: s, navMode, fontFamily });
  }, [themeId, navMode, fontFamily]);

  const handleSetNavMode = useCallback((m: "scroll" | "flip") => {
    setNavMode(m);
    savePrefs({ themeId, fontScale, navMode: m, fontFamily });
  }, [themeId, fontScale, fontFamily]);

  const handleSetFontFamily = useCallback((f: string) => {
    setFontFamily(f);
    savePrefs({ themeId, fontScale, navMode, fontFamily: f });
  }, [themeId, fontScale, navMode]);

  return (
    <ThemeCtx.Provider value={{
      theme, themes: THEMES, fontScale, navMode, fontFamily,
      setTheme: handleSetTheme,
      setFontScale: handleSetFontScale,
      setNavMode: handleSetNavMode,
      setFontFamily: handleSetFontFamily,
    }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export const useTheme = () => useContext(ThemeCtx);
