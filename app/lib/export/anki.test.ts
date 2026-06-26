import { test, expect } from "vitest";
import { toAnkiTsv } from "./anki";
import type { Flashcard } from "@/types";

const card = (q: string, a: string): Flashcard => ({
  id: q,
  question: q,
  answer: a,
  rarity: "normal",
});

test("serializa uma linha por carta com tab entre pergunta e resposta", () => {
  const tsv = toAnkiTsv([card("Q1", "A1"), card("Q2", "A2")]);
  expect(tsv).toBe("Q1\tA1\nQ2\tA2");
});

test("escapa tabs e quebras de linha no conteúdo", () => {
  const tsv = toAnkiTsv([card("per\tgunta", "linha1\nlinha2")]);
  expect(tsv).toBe("per gunta\tlinha1<br>linha2");
});

test("deck vazio retorna string vazia", () => {
  expect(toAnkiTsv([])).toBe("");
});
