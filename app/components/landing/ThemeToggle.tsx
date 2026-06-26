"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  // Inicializa a partir do que o script anti-flash já aplicou no <html>.
  const [dark, setDark] = useState(true);

  useEffect(() => {
    setDark(!document.documentElement.classList.contains("light"));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("light", !next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // localStorage indisponível — segue sem persistir
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label="Alternar tema"
      className="text-xl text-ink/70 hover:text-ink"
    >
      {dark ? "◐" : "◑"}
    </button>
  );
}
