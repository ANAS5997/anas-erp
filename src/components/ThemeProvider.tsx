"use client";

import React, { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, language } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // Apply theme
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      root.style.colorScheme = "light";
    }

    // Apply language direction
    root.setAttribute("lang", language);
    root.setAttribute("dir", language === "ar" ? "rtl" : "ltr");
  }, [theme, language, mounted]);

  // Prevent flash by showing basic container until store state is hydrated
  if (!mounted) {
    return <div className="min-h-screen bg-slate-950 text-white antialiased">{children}</div>;
  }

  return <>{children}</>;
}
