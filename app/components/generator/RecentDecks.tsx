"use client";

import type { RecentDeck } from "@/app/lib/recent-decks";
import {
  CARD_TYPE_OPTIONS,
  FOCUS_OPTIONS,
} from "@/app/lib/generate-options";

const cardTypeLabel = (v: string) =>
  CARD_TYPE_OPTIONS.find((o) => o.value === v)?.label ?? v;
const focusLabel = (v: string) =>
  FOCUS_OPTIONS.find((o) => o.value === v)?.label ?? v;

type Props = {
  decks: RecentDeck[];
  onRestore: (deck: RecentDeck) => void;
  onClear: () => void;
};

export function RecentDecks({ decks, onRestore, onClear }: Props) {
  if (decks.length === 0) return null;

  return (
    <section className="mx-auto mt-8 w-[calc(100%-2rem)] max-w-2xl">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xs font-medium uppercase tracking-wider text-ink/50">
          Decks recentes
        </h2>
        <button
          onClick={onClear}
          className="text-xs text-ink/40 transition hover:text-ink/70"
        >
          Limpar
        </button>
      </div>
      <ul className="space-y-2">
        {decks.map((deck) => (
          <li key={deck.id}>
            <button
              onClick={() => onRestore(deck)}
              className="flex w-full items-center justify-between gap-3 rounded-xl border border-primary/15 bg-surface/50 px-4 py-3 text-left transition hover:border-primary/50 hover:bg-surface/80"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm text-ink/90">
                  {deck.cards[0]?.question ?? "Deck"}
                </span>
                <span className="text-xs text-ink/45">
                  {deck.cards.length} cartas · {cardTypeLabel(deck.options.cardType)} ·{" "}
                  {focusLabel(deck.options.focus)}
                </span>
              </span>
              <span className="shrink-0 text-xs text-primary">Abrir →</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
