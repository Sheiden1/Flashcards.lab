import type { Flashcard } from "@/types";

/**
 * Limpa um campo para o formato TSV do Anki: tabs viram espaço (separador de
 * coluna) e quebras de linha viram <br> (o Anki interpreta HTML nos campos).
 */
function escapeField(value: string): string {
  return value.replace(/\t/g, " ").replace(/\r?\n/g, "<br>");
}

/**
 * Serializa o deck no formato que o Anki importa direto: uma carta por linha,
 * `pergunta⇥resposta`. Função pura — fácil de testar.
 */
export function toAnkiTsv(cards: Flashcard[]): string {
  return cards
    .map((c) => `${escapeField(c.question)}\t${escapeField(c.answer)}`)
    .join("\n");
}

/** Gera o arquivo .txt TSV e dispara o download. */
export function downloadAnkiDeck(cards: Flashcard[]) {
  if (cards.length === 0) return;
  const blob = new Blob([toAnkiTsv(cards)], {
    type: "text/plain;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = "flashcards-anki.txt";
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}
