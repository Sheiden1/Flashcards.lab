import { test, expect } from "vitest";
import { wrapText, sheetLayout } from "./card-image";

// ctx fake: cada caractere "mede" 10px de largura
const ctx = {
  measureText: (s: string) => ({ width: s.length * 10 }) as TextMetrics,
};

test("mantém em uma linha quando cabe", () => {
  expect(wrapText(ctx, "abc def", 1000)).toEqual(["abc def"]);
});

test("quebra em múltiplas linhas quando excede a largura", () => {
  // maxWidth 50 → cabem ~5 chars por linha
  const lines = wrapText(ctx, "aaaa bbbb cccc", 50);
  expect(lines.length).toBeGreaterThan(1);
  expect(lines.join(" ")).toBe("aaaa bbbb cccc");
});

test("uma palavra mais longa que a largura fica sozinha na linha", () => {
  const lines = wrapText(ctx, "supercalifragilistico curto", 80);
  expect(lines[0]).toBe("supercalifragilistico");
});

test("texto vazio retorna lista vazia", () => {
  expect(wrapText(ctx, "", 100)).toEqual([]);
});

test("sheetLayout limita a 3 colunas e calcula linhas", () => {
  expect(sheetLayout(0)).toEqual({ cols: 0, rows: 0 });
  expect(sheetLayout(2)).toEqual({ cols: 2, rows: 1 });
  expect(sheetLayout(3)).toEqual({ cols: 3, rows: 1 });
  expect(sheetLayout(5)).toEqual({ cols: 3, rows: 2 });
  expect(sheetLayout(6)).toEqual({ cols: 3, rows: 2 });
  expect(sheetLayout(7)).toEqual({ cols: 3, rows: 3 });
});
