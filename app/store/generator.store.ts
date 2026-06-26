import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Flashcard } from "@/types";
import {
  DEFAULT_OPTIONS,
  normalizeOptions,
  type GenerateOptions,
} from "@/app/lib/generate-options";

type Tab = "text" | "pdf";
type Status = "idle" | "generating" | "success" | "error";

interface GeneratorState {
  tab: Tab;
  count: number;
  options: GenerateOptions;
  cards: Flashcard[];
  status: Status;
  flipped: Set<string>;
  setTab: (t: Tab) => void;
  setCount: (n: number) => void;
  setOption: <K extends keyof GenerateOptions>(
    key: K,
    value: GenerateOptions[K],
  ) => void;
  setOptions: (o: GenerateOptions) => void;
  setCards: (c: Flashcard[]) => void;
  setStatus: (s: Status) => void;
  toggleFlip: (id: string) => void;
  flipAll: () => void;
  unflipAll: () => void;
  reset: () => void;
}

// Apenas as opções de geração são persistidas. Estado de UI (cards, flip,
// status, aba) nunca é salvo. `skipHydration` evita mismatch de SSR: a store
// nasce com DEFAULT_OPTIONS e é reidratada no cliente via useHydrateOptions.
export const useGeneratorStore = create<GeneratorState>()(
  persist(
    (set) => ({
      tab: "text",
      count: 10,
      options: DEFAULT_OPTIONS,
      cards: [],
      status: "idle",
      flipped: new Set(),
      setTab: (tab) => set({ tab }),
      setCount: (count) => set({ count }),
      setOption: (key, value) =>
        set((s) => ({ options: { ...s.options, [key]: value } })),
      setOptions: (options) => set({ options }),
      setCards: (cards) => set({ cards }),
      setStatus: (status) => set({ status }),
      toggleFlip: (id) =>
        set((s) => {
          const next = new Set(s.flipped);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return { flipped: next };
        }),
      flipAll: () =>
        set((s) => ({ flipped: new Set(s.cards.map((c) => c.id)) })),
      unflipAll: () => set({ flipped: new Set() }),
      reset: () => set({ cards: [], status: "idle", flipped: new Set() }),
    }),
    {
      name: "flashcardslab:options",
      skipHydration: true,
      partialize: (s) => ({ options: s.options }),
      // Tolera dados antigos/corrompidos no storage.
      merge: (persisted, current) => ({
        ...current,
        options: normalizeOptions(
          (persisted as { options?: unknown } | undefined)?.options,
        ),
      }),
    },
  ),
);

/** Reidrata as opções salvas no cliente. Chamar uma vez, após montar. */
export function hydrateGeneratorOptions() {
  void useGeneratorStore.persist.rehydrate();
}
