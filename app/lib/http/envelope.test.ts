import { test, expect } from "vitest";
import { ok, fail } from "./envelope";

test("ok wraps data", () => {
  expect(ok({ cards: [] })).toEqual({ success: true, data: { cards: [] } });
});

test("fail wraps error", () => {
  expect(fail("AI_ERROR", "boom")).toEqual({
    success: false,
    error: { code: "AI_ERROR", message: "boom" },
  });
});
