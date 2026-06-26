import { test, expect } from "vitest";
import { assignRarity } from "./rarity";

test("assignRarity marks exactly one holographic", () => {
  const out = assignRarity([
    { question: "a", answer: "1" },
    { question: "b", answer: "2" },
    { question: "c", answer: "3" },
  ]);
  expect(out.filter((c) => c.rarity === "holographic")).toHaveLength(1);
  expect(out.every((c) => c.id)).toBe(true);
});

test("assignRarity handles empty input", () => {
  expect(assignRarity([])).toEqual([]);
});
