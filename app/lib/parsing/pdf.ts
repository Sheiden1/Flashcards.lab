import { extractText as unpdfExtract, getDocumentProxy } from "unpdf";

export async function extractText(buffer: ArrayBuffer): Promise<string> {
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text } = await unpdfExtract(pdf, { mergePages: true });
  const joined = Array.isArray(text) ? text.join("\n") : text;
  if (!joined || !joined.trim()) throw new Error("PDF_NO_TEXT");
  return joined.trim();
}
