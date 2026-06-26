import { vi, test, expect } from "vitest";
import { extractText as unpdfExtract } from "unpdf";
import { extractText } from "./pdf";

vi.mock("unpdf", () => ({
  extractText: vi.fn(async () => ({ text: "hello world" })),
  getDocumentProxy: vi.fn(async () => ({})),
}));

const mockedExtract = vi.mocked(unpdfExtract);

test("retorna o texto quando há string", async () => {
  mockedExtract.mockResolvedValueOnce({ totalPages: 1, text: "hello world" });
  const out = await extractText(new ArrayBuffer(8));
  expect(out).toContain("hello world");
});

test("junta páginas quando o texto vem como array", async () => {
  // unpdf tipa `text` como string, mas em runtime pode vir array (mergePages
  // false); o cast cobre esse branch defensivo de extractText.
  mockedExtract.mockResolvedValueOnce({
    totalPages: 2,
    text: ["pagina 1", "pagina 2"] as unknown as string,
  });
  const out = await extractText(new ArrayBuffer(8));
  expect(out).toBe("pagina 1\npagina 2");
});

test("lança PDF_NO_TEXT quando o texto é vazio", async () => {
  mockedExtract.mockResolvedValueOnce({ totalPages: 1, text: "   " });
  await expect(extractText(new ArrayBuffer(8))).rejects.toThrow("PDF_NO_TEXT");
});
