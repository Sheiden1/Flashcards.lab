export function buildPrompt(content: string, count: number): string {
  return [
    `You are a study assistant. Create exactly ${count} flashcards from the content below.`,
    "Detect the language of the content and write the flashcards in that same language.",
    "Each flashcard is a question/answer pair. Keep answers concise and factual.",
    'Respond ONLY with a JSON array of objects with keys "question" and "answer".',
    "",
    "CONTENT:",
    content,
  ].join("\n");
}
