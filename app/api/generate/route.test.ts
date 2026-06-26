import { vi, beforeEach, test, expect } from "vitest";

// Mock do motor de IA — não chama a Gemini de verdade.
vi.mock("@/app/lib/ai/provider", () => ({
  geminiProvider: {
    generateCards: vi.fn(async (_content: string, count: number) =>
      Array.from({ length: count }, (_, i) => ({
        question: `Q${i}`,
        answer: `A${i}`,
      })),
    ),
  },
}));

import { POST } from "./route";
import { __reset } from "@/app/lib/rate-limit";

beforeEach(() => __reset());

function jsonRequest(body: unknown, ip = "1.2.3.4") {
  return new Request("http://localhost/api/generate", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(body),
  });
}

test("gera deck válido e marca exatamente uma carta holográfica", async () => {
  const res = await POST(jsonRequest({ text: "conteúdo de estudo", count: 6 }));
  const json = await res.json();
  expect(res.status).toBe(200);
  expect(json.success).toBe(true);
  expect(json.data.cards).toHaveLength(6);
  expect(
    json.data.cards.filter((c: { rarity: string }) => c.rarity === "holographic"),
  ).toHaveLength(1);
});

test("rejeita entrada inválida com INVALID_INPUT", async () => {
  const res = await POST(jsonRequest({ text: "", count: 6 }));
  const json = await res.json();
  expect(res.status).toBe(400);
  expect(json.success).toBe(false);
  expect(json.error.code).toBe("INVALID_INPUT");
});

test("rejeita count fora do intervalo", async () => {
  const res = await POST(jsonRequest({ text: "ok", count: 99 }));
  const json = await res.json();
  expect(json.success).toBe(false);
  expect(json.error.code).toBe("INVALID_INPUT");
});

test("aplica rate limit após 10 gerações do mesmo IP", async () => {
  const ip = "9.9.9.9";
  for (let i = 0; i < 10; i++) {
    await POST(jsonRequest({ text: "ok", count: 5 }, ip));
  }
  const res = await POST(jsonRequest({ text: "ok", count: 5 }, ip));
  const json = await res.json();
  expect(res.status).toBe(429);
  expect(json.error.code).toBe("RATE_LIMITED");
});
