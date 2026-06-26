import { vi, test, expect } from "vitest";
import { extractText } from "./pdf";

vi.mock("unpdf", () => ({
  extractText: vi.fn(async () => ({ text: "hello world" })),
  getDocumentProxy: vi.fn(async () => ({})),
}));

test("returns joined text", async () => {
  const out = await extractText(new ArrayBuffer(8));
  expect(out).toContain("hello world");
});
