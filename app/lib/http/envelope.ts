import type { Flashcard } from "@/types";

export function ok(data: { cards: Flashcard[] }) {
  return { success: true as const, data };
}

export function fail(code: string, message: string) {
  return { success: false as const, error: { code, message } };
}
