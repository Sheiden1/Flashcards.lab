import { beforeEach, test, expect } from "vitest";
import { checkRateLimit, __reset } from "./rate-limit";

beforeEach(() => __reset());

test("allows up to 10 in window", () => {
  const t = 1_000_000;
  for (let i = 0; i < 10; i++) expect(checkRateLimit("1.1.1.1", t)).toBe(true);
  expect(checkRateLimit("1.1.1.1", t)).toBe(false);
});

test("frees up after window passes", () => {
  const t = 1_000_000;
  for (let i = 0; i < 10; i++) checkRateLimit("2.2.2.2", t);
  expect(checkRateLimit("2.2.2.2", t + 60 * 60 * 1000 + 1)).toBe(true);
});
