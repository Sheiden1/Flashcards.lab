import type { Flashcard } from "@/types";

export function assignRarity(
  pairs: { question: string; answer: string }[],
): Flashcard[] {
  const holoIndex =
    pairs.length > 0 ? Math.floor(Math.random() * pairs.length) : -1;
  return pairs.map((p, i) => ({
    id: `${i}-${p.question.slice(0, 8)}`,
    question: p.question,
    answer: p.answer,
    rarity: i === holoIndex ? "holographic" : "normal",
  }));
}
