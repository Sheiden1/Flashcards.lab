import { test, expect } from "vitest";
import { isAuthError } from "./classify-error";

test("detecta por status 401/403", () => {
  expect(isAuthError({ status: 401 })).toBe(true);
  expect(isAuthError({ status: 403 })).toBe(true);
});

test("detecta por mensagem típica da Gemini", () => {
  expect(isAuthError(new Error("API key not valid. Please pass a valid API key."))).toBe(true);
  expect(isAuthError(new Error("PERMISSION_DENIED"))).toBe(true);
});

test("não confunde erro genérico com auth", () => {
  expect(isAuthError(new Error("network timeout"))).toBe(false);
  expect(isAuthError({ status: 500 })).toBe(false);
  expect(isAuthError(null)).toBe(false);
});
