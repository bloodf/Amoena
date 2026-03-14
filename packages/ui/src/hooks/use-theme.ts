import { useState, useEffect } from "react";

type Theme = "dark" | "light";

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("lunaria-theme") as Theme) || "dark";
    }
    return "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("light");
    } else {
      root.classList.remove("light");
    }
    localStorage.setItem("lunaria-theme", theme);
  }, [theme]);

  const toggleTheme = () => setThemeState(prev => prev === "dark" ? "light" : "dark");

  return { theme, setTheme: setThemeState, toggleTheme };
}
