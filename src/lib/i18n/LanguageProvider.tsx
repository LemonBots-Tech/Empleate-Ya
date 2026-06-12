"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type AppLanguage = "es" | "en";

type LanguageContextValue = {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
};

const STORAGE_KEY = "empleate-ya-language";
const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>("es");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "es") setLanguageState(stored);
  }, []);

  const value = useMemo<LanguageContextValue>(() => ({
    language,
    setLanguage(nextLanguage) {
      setLanguageState(nextLanguage);
      window.localStorage.setItem(STORAGE_KEY, nextLanguage);
      document.documentElement.lang = nextLanguage === "en" ? "en-US" : "es-MX";
    },
  }), [language]);

  useEffect(() => {
    document.documentElement.lang = language === "en" ? "en-US" : "es-MX";
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}

export const appLanguageOptions = [
  { value: "es", label: "Español", shortLabel: "ES", flagClass: "fi fi-mx" },
  { value: "en", label: "English", shortLabel: "EN", flagClass: "fi fi-us" },
] as const satisfies Array<{ value: AppLanguage; label: string; shortLabel: string; flagClass: string }>;
