"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    // Respect saved preference; otherwise default to dark (this is an operator tool)
    const saved = localStorage.getItem("theme") as "dark" | "light" | null;
    const initial = saved ?? "dark";
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  }

  return (
    <button
      onClick={toggle}
      className="btn-ghost"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      style={{ padding: "6px 10px", fontSize: "1rem" }}
    >
      {theme === "dark" ? "☀" : "☽"}
    </button>
  );
}
