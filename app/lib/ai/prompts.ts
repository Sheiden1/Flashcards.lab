import {
  DEFAULT_OPTIONS,
  type GenerateOptions,
} from "@/app/lib/generate-options";

const DEPTH_INSTRUCTIONS: Record<GenerateOptions["depth"], string> = {
  essencial:
    "Keep each card short and direct — ideal for quick review. Minimal context, just the core fact.",
  completo:
    "Make each card more explanatory, adding the context and reasoning needed to truly understand the topic.",
};

const CARD_TYPE_INSTRUCTIONS: Record<GenerateOptions["cardType"], string> = {
  qa: 'Each card is a direct question in "question" and its answer in "answer".',
  lacuna:
    'Each "question" is a sentence with a key term replaced by "_____" (fill in the blank). The "answer" is the missing term.',
  multipla:
    'Each "question" states the question followed by 4 lettered options (A, B, C, D), one correct. The "answer" gives the correct letter and the full correct option text.',
  conceito:
    'Each "question" is a concept or term to be defined, and "answer" is its clear definition.',
};

const DIFFICULTY_INSTRUCTIONS: Record<GenerateOptions["difficulty"], string> = {
  basico:
    "Target a beginner: focus on fundamental, introductory points using simple language.",
  intermediario:
    "Target someone with working knowledge: balance fundamentals with relevant detail.",
  avancado:
    "Target an advanced learner: emphasize nuance, edge cases and deeper connections.",
};

const FOCUS_INSTRUCTIONS: Record<GenerateOptions["focus"], string> = {
  prova:
    "Optimize for exam preparation: prioritize content likely to be tested.",
  concurso:
    "Optimize for competitive public exams (concursos): emphasize precise definitions, laws and details that are commonly asked.",
  faculdade:
    "Optimize for university study: emphasize conceptual understanding and how ideas connect.",
  memorizacao:
    "Optimize for memorization: short, punchy cards that are easy to drill repeatedly.",
  resumo:
    "Optimize for a general overview: cover the most important points broadly.",
};

export function buildPrompt(
  content: string,
  count: number,
  options: GenerateOptions = DEFAULT_OPTIONS,
): string {
  return [
    `You are a study assistant. Create exactly ${count} flashcards from the content below.`,
    "Detect the language of the content and write the flashcards in that same language.",
    'Respond ONLY with a JSON array of objects with keys "question" and "answer".',
    "",
    "Follow these requirements:",
    `- Card style: ${CARD_TYPE_INSTRUCTIONS[options.cardType]}`,
    `- Depth: ${DEPTH_INSTRUCTIONS[options.depth]}`,
    `- Difficulty: ${DIFFICULTY_INSTRUCTIONS[options.difficulty]}`,
    `- Focus: ${FOCUS_INSTRUCTIONS[options.focus]}`,
    "",
    "CONTENT:",
    content,
  ].join("\n");
}
