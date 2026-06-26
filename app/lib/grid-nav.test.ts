import { test, expect } from "vitest";
import { nextFocusIndex, isArrowKey } from "./grid-nav";

// grid 3 colunas, 6 itens (índices 0..5)
const COLS = 3;
const TOTAL = 6;

test("direita avança um", () => {
  expect(nextFocusIndex(0, "ArrowRight", COLS, TOTAL)).toBe(1);
});

test("baixo desce uma linha (+cols)", () => {
  expect(nextFocusIndex(1, "ArrowDown", COLS, TOTAL)).toBe(4);
});

test("esquerda volta um", () => {
  expect(nextFocusIndex(3, "ArrowLeft", COLS, TOTAL)).toBe(2);
});

test("cima sobe uma linha (-cols)", () => {
  expect(nextFocusIndex(4, "ArrowUp", COLS, TOTAL)).toBe(1);
});

test("não passa do fim", () => {
  expect(nextFocusIndex(5, "ArrowRight", COLS, TOTAL)).toBe(5);
  expect(nextFocusIndex(5, "ArrowDown", COLS, TOTAL)).toBe(5);
});

test("não passa do início", () => {
  expect(nextFocusIndex(0, "ArrowLeft", COLS, TOTAL)).toBe(0);
  expect(nextFocusIndex(0, "ArrowUp", COLS, TOTAL)).toBe(0);
});

test("isArrowKey reconhece só as setas", () => {
  expect(isArrowKey("ArrowRight")).toBe(true);
  expect(isArrowKey("Enter")).toBe(false);
});
