import { test, expect } from "vitest";
import { SAMPLE_DECK } from "./sample-deck";

test("tem exatamente uma carta holográfica", () => {
  expect(
    SAMPLE_DECK.filter((c) => c.rarity === "holographic"),
  ).toHaveLength(1);
});

test("toda carta tem id, pergunta e resposta não vazios", () => {
  for (const card of SAMPLE_DECK) {
    expect(card.id).toBeTruthy();
    expect(card.question.trim()).not.toBe("");
    expect(card.answer.trim()).not.toBe("");
  }
});

test("ids são únicos", () => {
  const ids = SAMPLE_DECK.map((c) => c.id);
  expect(new Set(ids).size).toBe(ids.length);
});
