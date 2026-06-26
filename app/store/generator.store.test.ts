import { beforeEach, test, expect } from "vitest";
import { useGeneratorStore } from "./generator.store";
import type { Flashcard } from "@/types";

const cards: Flashcard[] = [
  { id: "a", question: "qa", answer: "ra", rarity: "normal" },
  { id: "b", question: "qb", answer: "rb", rarity: "holographic" },
];

beforeEach(() => {
  useGeneratorStore.setState({
    tab: "text",
    count: 10,
    cards: [],
    status: "idle",
    flipped: new Set(),
  });
});

test("toggleFlip adiciona e remove o id", () => {
  const { toggleFlip } = useGeneratorStore.getState();
  toggleFlip("a");
  expect(useGeneratorStore.getState().flipped.has("a")).toBe(true);
  toggleFlip("a");
  expect(useGeneratorStore.getState().flipped.has("a")).toBe(false);
});

test("flipAll marca todos os ids das cartas atuais", () => {
  useGeneratorStore.setState({ cards });
  useGeneratorStore.getState().flipAll();
  const flipped = useGeneratorStore.getState().flipped;
  expect(flipped.size).toBe(2);
  expect(flipped.has("a") && flipped.has("b")).toBe(true);
});

test("unflipAll limpa o conjunto", () => {
  useGeneratorStore.setState({ cards, flipped: new Set(["a", "b"]) });
  useGeneratorStore.getState().unflipAll();
  expect(useGeneratorStore.getState().flipped.size).toBe(0);
});

test("reset volta ao estado inicial de cartas/status/flip", () => {
  useGeneratorStore.setState({
    cards,
    status: "success",
    flipped: new Set(["a"]),
  });
  useGeneratorStore.getState().reset();
  const s = useGeneratorStore.getState();
  expect(s.cards).toEqual([]);
  expect(s.status).toBe("idle");
  expect(s.flipped.size).toBe(0);
});

test("setters atualizam tab e count", () => {
  useGeneratorStore.getState().setTab("pdf");
  useGeneratorStore.getState().setCount(15);
  const s = useGeneratorStore.getState();
  expect(s.tab).toBe("pdf");
  expect(s.count).toBe(15);
});
