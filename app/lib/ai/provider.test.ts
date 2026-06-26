import { vi, test, expect } from "vitest";

const generateContent = vi.fn(async () => ({
  text: JSON.stringify([{ question: "Q1", answer: "A1" }]),
}));

vi.mock("@google/genai", () => ({
  GoogleGenAI: class {
    models = { generateContent };
  },
}));

test("parses gemini json into cards", async () => {
  const { geminiProvider } = await import("./provider");
  const cards = await geminiProvider.generateCards("some content", 5);
  expect(cards).toEqual([{ question: "Q1", answer: "A1" }]);
});
