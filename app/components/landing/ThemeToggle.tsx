"use client";

import { useSyncExternalStore } from "react";

const THEME_EVENT = "themechange";

function subscribe(callback: () => void) {
  window.addEventListener(THEME_EVENT, callback);
  return () => window.removeEventListener(THEME_EVENT, callback);
}

function getSnapshot(): "light" | "dark" {
  return document.documentElement.classList.contains("light")
    ? "light"
    : "dark";
}

function getServerSnapshot(): "light" | "dark" {
  // SSR sempre renderiza dark (padrão da marca); o script anti-flash ajusta
  // a classe no cliente e o useSyncExternalStore re-renderiza sem mismatch.
  return "dark";
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const dark = theme === "dark";

  function toggle() {
    const nextLight = dark;
    document.documentElement.classList.toggle("light", nextLight);
    try {
      localStorage.setItem("theme", nextLight ? "light" : "dark");
    } catch {
      // localStorage indisponível — segue sem persistir
    }
    window.dispatchEvent(new Event(THEME_EVENT));
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
