export type Rarity = "normal" | "holographic";

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  rarity: Rarity;
}

export interface GenerateRequest {
  source: "text" | "pdf";
  text?: string;
  count: number;
}

export type GenerateResponse =
  | { success: true; data: { cards: Flashcard[] } }
  | { success: false; error: { code: string; message: string } };
