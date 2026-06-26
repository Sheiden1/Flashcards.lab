import type { Flashcard, GenerateResponse } from "@/types";

export type GenerateOutcome =
  | { kind: "deck"; cards: Flashcard[] }
  | { kind: "error"; message: string; retryable: boolean };

const EMPTY_MESSAGE =
  "Não consegui montar cartas desse conteúdo. Tente um texto mais detalhado.";

// Erros de configuração do servidor: clicar "tentar de novo" não resolve.
const NON_RETRYABLE = new Set(["CONFIG_ERROR", "INVALID_API_KEY"]);

/**
 * Decide o que a UI deve mostrar a partir da resposta do endpoint:
 * deck (sucesso com cartas), ou erro (falha OU sucesso sem cartas).
 * Também marca se faz sentido oferecer "tentar de novo".
 * Função pura — fácil de testar e isola o branch delicado fora do componente.
 */
export function resolveGenerateResult(res: GenerateResponse): GenerateOutcome {
  if (res.success && res.data.cards.length > 0) {
    return { kind: "deck", cards: res.data.cards };
  }
  if (res.success) {
    return { kind: "error", message: EMPTY_MESSAGE, retryable: true };
  }
  return {
    kind: "error",
    message: res.error.message,
    retryable: !NON_RETRYABLE.has(res.error.code),
  };
}
