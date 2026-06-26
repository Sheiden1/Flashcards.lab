import { test, expect } from "vitest";
import { buildPrompt } from "./prompts";

test("inclui a contagem exata pedida", () => {
  expect(buildPrompt("conteúdo", 7)).toContain("exactly 7 flashcards");
});

test("instrui a seguir o idioma do conteúdo", () => {
  expect(buildPrompt("conteúdo", 5).toLowerCase()).toContain("language");
});

test("pede JSON com as chaves question e answer", () => {
  const p = buildPrompt("conteúdo", 5);
  expect(p).toContain("question");
  expect(p).toContain("answer");
});

test("incorpora o conteúdo fornecido", () => {
  expect(buildPrompt("fotossíntese e clorofila", 5)).toContain(
    "fotossíntese e clorofila",
  );
});
