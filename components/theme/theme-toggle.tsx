"use client";

// components/theme/theme-toggle.tsx - Toggles the app theme between light and dark mode.
import { Moon, Sun } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

type Theme = "dark" | "light";

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
  window.localStorage.setItem("theme", theme);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (
      typeof document !== "undefined" &&
      document.documentElement.classList.contains("dark")
    ) {
      return "dark";
    }

    return "light";
  });
  const isDark = theme === "dark";

  function handleToggle() {
    const nextTheme = isDark ? "light" : "dark";

    applyTheme(nextTheme);
    setTheme(nextTheme);
  }

  return (
    <Button
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      onClick={handleToggle}
      size="icon"
      type="button"
      variant="ghost"
    >
      {isDark ? <Moon /> : <Sun />}
    </Button>
  );
}
