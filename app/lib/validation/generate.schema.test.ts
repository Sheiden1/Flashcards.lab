import { test, expect } from "vitest";
import { textSchema, validatePdfFile, MAX_TEXT } from "./generate.schema";

test("accepts valid text", () => {
  expect(textSchema.safeParse({ text: "hi", count: 10 }).success).toBe(true);
});

test("rejects empty text", () => {
  expect(textSchema.safeParse({ text: "", count: 10 }).success).toBe(false);
});

test("rejects text over max", () => {
  expect(
    textSchema.safeParse({ text: "a".repeat(MAX_TEXT + 1), count: 10 }).success,
  ).toBe(false);
});

test("rejects count out of range", () => {
  expect(textSchema.safeParse({ text: "hi", count: 21 }).success).toBe(false);
  expect(textSchema.safeParse({ text: "hi", count: 4 }).success).toBe(false);
});

test("validatePdfFile flags oversize", () => {
  const big = new File([new Uint8Array(2 * 1024 * 1024 + 1)], "x.pdf", {
    type: "application/pdf",
  });
  expect(validatePdfFile(big)).toBe("PDF_TOO_LARGE");
});

test("validatePdfFile flags wrong mime", () => {
  const txt = new File([new Uint8Array(10)], "x.txt", { type: "text/plain" });
  expect(validatePdfFile(txt)).toBe("INVALID_INPUT");
});

test("validatePdfFile accepts valid pdf", () => {
  const ok = new File([new Uint8Array(10)], "x.pdf", {
    type: "application/pdf",
  });
  expect(validatePdfFile(ok)).toBeNull();
});
