"use client";

import { useRef } from "react";
import { useGeneratorStore } from "@/app/store/generator.store";
import {
  downloadCardImage,
  downloadDeckImage,
} from "@/app/lib/export/card-image";
import { downloadAnkiDeck } from "@/app/lib/export/anki";
import { nextFocusIndex, isArrowKey } from "@/app/lib/grid-nav";
import { FlashcardCard } from "./FlashcardCard";

export function FlashcardDeck() {
  const cards = useGeneratorStore((s) => s.cards);
  const reset = useGeneratorStore((s) => s.reset);
  const flipAll = useGeneratorStore((s) => s.flipAll);
  const unflipAll = useGeneratorStore((s) => s.unflipAll);
  const allFlipped = useGeneratorStore(
    (s) => s.cards.length > 0 && s.flipped.size === s.cards.length,
  );
  const gridRef = useRef<HTMLDivElement>(null);

  if (cards.length === 0) return null;

  const holoCard = cards.find((c) => c.rarity === "holographic");
  const holoCount = cards.filter((c) => c.rarity === "holographic").length;

  function columnCount() {
    const grid = gridRef.current;
    if (!grid) return 1;
    const cols = getComputedStyle(grid).gridTemplateColumns.split(" ").length;
    return Math.max(1, cols);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (!isArrowKey(e.key)) return;
    const grid = gridRef.current;
    if (!grid) return;
    const buttons = Array.from(
      grid.querySelectorAll<HTMLButtonElement>("button:not([data-skip-nav])"),
    );
    const current = buttons.findIndex((b) => b === document.activeElement);
    if (current === -1) {
      buttons[0]?.focus();
      e.preventDefault();
      return;
    }
    const next = nextFocusIndex(current, e.key, columnCount(), buttons.length);
    if (next !== current) {
      buttons[next]?.focus();
      e.preventDefault();
    }
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink">
            Seu deck
          </h2>
          <p className="mt-1 text-sm text-ink/55">
            {cards.length} cartas · {holoCount} holográfica
            {holoCount === 1 ? "" : "s"} · clique ou use as setas + Enter
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => (allFlipped ? unflipAll() : flipAll())}
            className="rounded-lg border border-primary/50 px-4 py-2 text-sm text-ink/80 transition hover:bg-primary hover:text-white"
          >
            {allFlipped ? "Desvirar todas" : "Virar todas"}
          </button>
          <button
            onClick={() => downloadDeckImage(cards)}
            className="rounded-lg border border-primary/50 px-4 py-2 text-sm text-ink/80 transition hover:bg-primary hover:text-white"
          >
            Baixar deck
          </button>
          <button
            onClick={() => downloadAnkiDeck(cards)}
            className="rounded-lg border border-primary/50 px-4 py-2 text-sm text-ink/80 transition hover:bg-primary hover:text-white"
          >
            Exportar p/ Anki
          </button>
          {holoCard && (
            <button
              onClick={() => downloadCardImage(holoCard)}
              className="rounded-lg border border-holo/50 px-4 py-2 text-sm text-ink/80 transition hover:bg-holo hover:text-white"
            >
              Baixar carta rara
            </button>
          )}
          <button
            onClick={() => {
              reset();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="rounded-lg border border-primary/50 px-4 py-2 text-sm text-ink/80 transition hover:bg-primary hover:text-white"
          >
            Gerar outro deck
          </button>
        </div>
      </div>
      <div
        ref={gridRef}
        onKeyDown={handleKeyDown}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3"
      >
        {cards.map((c, i) => (
          <FlashcardCard key={c.id} card={c} index={i} />
        ))}
      </div>
    </section>
  );
}
