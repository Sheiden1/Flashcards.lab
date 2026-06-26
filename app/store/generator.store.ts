import { create } from "zustand";
import type { Flashcard } from "@/types";
import {
  DEFAULT_OPTIONS,
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

export const useGeneratorStore = create<GeneratorState>((set) => ({
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
  flipAll: () => set((s) => ({ flipped: new Set(s.cards.map((c) => c.id)) })),
  unflipAll: () => set({ flipped: new Set() }),
  reset: () => set({ cards: [], status: "idle", flipped: new Set() }),
}));
