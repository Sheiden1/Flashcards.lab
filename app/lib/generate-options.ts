// Fonte única de verdade para as opções de geração de flashcards.
// Tipos, valores válidos, defaults e labels (UI) e instruções (prompt da IA)
// vivem aqui para não duplicar entre store, validação, request e prompt.

export type Depth = "essencial" | "completo";
export type CardType = "qa" | "lacuna" | "multipla" | "conceito";
export type Difficulty = "basico" | "intermediario" | "avancado";
export type Focus = "prova" | "concurso" | "faculdade" | "memorizacao" | "resumo";

export interface GenerateOptions {
  depth: Depth;
  cardType: CardType;
  difficulty: Difficulty;
  focus: Focus;
}

export const DEFAULT_OPTIONS: GenerateOptions = {
  depth: "essencial",
  cardType: "qa",
  difficulty: "intermediario",
  focus: "resumo",
};

// Cada grupo de opção: valor válido + label exibido na UI.
type Option<T extends string> = { value: T; label: string };

export const DEPTH_OPTIONS: Option<Depth>[] = [
  { value: "essencial", label: "Essencial" },
  { value: "completo", label: "Completo" },
];

export const CARD_TYPE_OPTIONS: Option<CardType>[] = [
  { value: "qa", label: "Pergunta e resposta" },
  { value: "lacuna", label: "Complete a lacuna" },
  { value: "multipla", label: "Múltipla escolha" },
  { value: "conceito", label: "Conceito e definição" },
];

export const DIFFICULTY_OPTIONS: Option<Difficulty>[] = [
  { value: "basico", label: "Básico" },
  { value: "intermediario", label: "Intermediário" },
  { value: "avancado", label: "Avançado" },
];

export const FOCUS_OPTIONS: Option<Focus>[] = [
  { value: "prova", label: "Prova" },
  { value: "concurso", label: "Concurso" },
  { value: "faculdade", label: "Faculdade" },
  { value: "memorizacao", label: "Memorização" },
  { value: "resumo", label: "Resumo geral" },
];

const labelOf = <T extends string>(opts: Option<T>[], value: T): string =>
  opts.find((o) => o.value === value)?.label ?? value;

/** Resumo curto das opções para exibir no card recolhido. */
export function summarizeOptions(o: GenerateOptions): string {
  return [
    labelOf(DEPTH_OPTIONS, o.depth),
    labelOf(CARD_TYPE_OPTIONS, o.cardType),
    labelOf(DIFFICULTY_OPTIONS, o.difficulty),
    labelOf(FOCUS_OPTIONS, o.focus),
  ].join(" · ");
}

const DEPTH_VALUES = DEPTH_OPTIONS.map((o) => o.value);
const CARD_TYPE_VALUES = CARD_TYPE_OPTIONS.map((o) => o.value);
const DIFFICULTY_VALUES = DIFFICULTY_OPTIONS.map((o) => o.value);
const FOCUS_VALUES = FOCUS_OPTIONS.map((o) => o.value);

// Normaliza um valor desconhecido (form-data, json, localStorage) para uma
// opção válida, caindo no default quando inválido. Mantém o servidor e o
// restore de decks recentes tolerantes a entrada malformada.
export function normalizeOptions(input: unknown): GenerateOptions {
  const o = (input ?? {}) as Record<string, unknown>;
  const pick = <T extends string>(
    value: unknown,
    valid: readonly T[],
    fallback: T,
  ): T => (valid.includes(value as T) ? (value as T) : fallback);

  return {
    depth: pick(o.depth, DEPTH_VALUES, DEFAULT_OPTIONS.depth),
    cardType: pick(o.cardType, CARD_TYPE_VALUES, DEFAULT_OPTIONS.cardType),
    difficulty: pick(
      o.difficulty,
      DIFFICULTY_VALUES,
      DEFAULT_OPTIONS.difficulty,
    ),
    focus: pick(o.focus, FOCUS_VALUES, DEFAULT_OPTIONS.focus),
  };
}
