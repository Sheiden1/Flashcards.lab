import { test, expect } from "vitest";
import { resolveGenerateResult } from "./generate-result";
import type { Flashcard } from "@/types";

const card: Flashcard = {
  id: "a",
  question: "q",
  answer: "r",
  rarity: "normal",
};

test("sucesso com cartas → deck", () => {
  const out = resolveGenerateResult({
    success: true,
    data: { cards: [card] },
  });
  expect(out).toEqual({ kind: "deck", cards: [card] });
});

test("sucesso sem cartas → erro amigável e retryable", () => {
  const out = resolveGenerateResult({ success: true, data: { cards: [] } });
  expect(out.kind).toBe("error");
  if (out.kind === "error") {
    expect(out.message).toMatch(/não consegui montar cartas/i);
    expect(out.retryable).toBe(true);
  }
});

test("falha genérica (AI_ERROR) → retryable", () => {
  const out = resolveGenerateResult({
    success: false,
    error: { code: "AI_ERROR", message: "Erro ao gerar, tente de novo." },
  });
  expect(out).toEqual({
    kind: "error",
    message: "Erro ao gerar, tente de novo.",
    retryable: true,
  });
});

test("erros de configuração do servidor não são retryable", () => {
  for (const code of ["CONFIG_ERROR", "INVALID_API_KEY"]) {
    const out = resolveGenerateResult({
      success: false,
      error: { code, message: "x" },
    });
    expect(out).toEqual({ kind: "error", message: "x", retryable: false });
  }
});
