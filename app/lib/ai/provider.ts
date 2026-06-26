import { GoogleGenAI } from "@google/genai";
import { buildPrompt } from "./prompts";
import {
  DEFAULT_OPTIONS,
  type GenerateOptions,
} from "@/app/lib/generate-options";

export interface AIProvider {
  generateCards(
    content: string,
    count: number,
    options?: GenerateOptions,
  ): Promise<{ question: string; answer: string }[]>;
}

const MODEL = "gemini-2.5-flash";

export const geminiProvider: AIProvider = {
  async generateCards(content, count, options = DEFAULT_OPTIONS) {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const res = await ai.models.generateContent({
      model: MODEL,
      contents: buildPrompt(content, count, options),
      config: { responseMimeType: "application/json" },
    });
    const raw = res.text ?? "[]";
    const parsed = JSON.parse(raw) as { question: string; answer: string }[];
    return parsed
      .filter((c) => c?.question && c?.answer)
      .slice(0, count)
      .map((c) => ({ question: String(c.question), answer: String(c.answer) }));
  },
};
