import type { Flashcard, GenerateResponse } from "@/types";

export type GenerateOutcome =
  | { kind: "deck"; cards: Flashcard[] }
  | { kind: "error"; message: string };

const EMPTY_MESSAGE =
  "Não consegui montar cartas desse conteúdo. Tente um texto mais detalhado.";

/**
 * Decide o que a UI deve mostrar a partir da resposta do endpoint:
 * deck (sucesso com cartas), ou erro (falha OU sucesso sem cartas).
 * Função pura — fácil de testar e isola o branch delicado fora do componente.
 */
export function resolveGenerateResult(res: GenerateResponse): GenerateOutcome {
  if (res.success && res.data.cards.length > 0) {
    return { kind: "deck", cards: res.data.cards };
  }
  if (res.success) {
    return { kind: "error", message: EMPTY_MESSAGE };
  }
  return { kind: "error", message: res.error.message };
}
