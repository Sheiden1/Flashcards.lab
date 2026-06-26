import type { Flashcard } from "@/types";
import { normalizeOptions, type GenerateOptions } from "./generate-options";

export interface RecentDeck {
  id: string;
  createdAt: number;
  cards: Flashcard[];
  options: GenerateOptions;
}

const STORAGE_KEY = "flashcardslab:recent-decks";
const MAX_DECKS = 5;

// Cache em memória + pub/sub para alimentar useSyncExternalStore sem
// setState-em-effect (evita renders em cascata e hydration mismatch).
let cache: RecentDeck[] | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export function subscribeRecentDecks(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Snapshot estável para o client; recarrega do localStorage na 1ª leitura. */
export function getRecentDecksSnapshot(): RecentDeck[] {
  if (cache === null) cache = loadRecentDecks();
  return cache;
}

/** Snapshot do servidor: sempre vazio (não há localStorage no SSR). */
export function getRecentDecksServerSnapshot(): RecentDeck[] {
  return EMPTY;
}

const EMPTY: RecentDeck[] = [];

function isFlashcard(c: unknown): c is Flashcard {
  const card = c as Record<string, unknown>;
  return (
    !!card &&
    typeof card.id === "string" &&
    typeof card.question === "string" &&
    typeof card.answer === "string"
  );
}

/** Lê os decks recentes do localStorage, tolerante a dados ausentes/corrompidos. */
export function loadRecentDecks(): RecentDeck[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (d): d is Record<string, unknown> =>
          !!d && typeof d === "object" && Array.isArray((d as RecentDeck).cards),
      )
      .map((d) => ({
        id: String(d.id ?? ""),
        createdAt: Number(d.createdAt ?? 0),
        cards: (d.cards as unknown[]).filter(isFlashcard),
        options: normalizeOptions(d.options),
      }))
      .filter((d) => d.id && d.cards.length > 0);
  } catch {
    return [];
  }
}

/**
 * Adiciona um deck ao topo da lista de recentes (dedup por id), mantém no
 * máximo MAX_DECKS e persiste. Retorna a nova lista. Falha silenciosa se o
 * localStorage estiver indisponível (modo privado, quota cheia).
 */
export function saveRecentDeck(
  deck: Omit<RecentDeck, "id"> & { id?: string },
  existing: RecentDeck[] = loadRecentDecks(),
): RecentDeck[] {
  if (deck.cards.length === 0) return existing;
  const id = deck.id ?? `${deck.createdAt}-${deck.cards.length}`;
  const next = [
    { ...deck, id },
    ...existing.filter((d) => d.id !== id),
  ].slice(0, MAX_DECKS);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignora: persistência é best-effort
  }
  cache = next;
  emit();
  return next;
}

export function clearRecentDecks(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignora
  }
  cache = EMPTY;
  emit();
}
