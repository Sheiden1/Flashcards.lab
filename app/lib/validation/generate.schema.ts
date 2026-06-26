import { z } from "zod";

export const MAX_TEXT = 10000;
export const MAX_PDF_BYTES = 2 * 1024 * 1024;

export const countSchema = z.coerce.number().int().min(5).max(20);

export const textSchema = z.object({
  text: z.string().min(1).max(MAX_TEXT),
  count: countSchema,
});

export function validatePdfFile(file: File): string | null {
  if (file.type !== "application/pdf") return "INVALID_INPUT";
  if (file.size > MAX_PDF_BYTES) return "PDF_TOO_LARGE";
  return null;
}
