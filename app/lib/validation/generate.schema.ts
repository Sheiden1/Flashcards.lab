import { z } from "zod";
import { DEFAULT_OPTIONS } from "@/app/lib/generate-options";

export const MAX_TEXT = 10000;
export const MAX_PDF_BYTES = 2 * 1024 * 1024;

export const countSchema = z.coerce.number().int().min(5).max(20);

export const optionsSchema = z.object({
  depth: z.enum(["essencial", "completo"]),
  cardType: z.enum(["qa", "lacuna", "multipla", "conceito"]),
  difficulty: z.enum(["basico", "intermediario", "avancado"]),
  focus: z.enum(["prova", "concurso", "faculdade", "memorizacao", "resumo"]),
});

export const textSchema = z.object({
  text: z.string().min(1).max(MAX_TEXT),
  count: countSchema,
  options: optionsSchema.default(DEFAULT_OPTIONS),
});

export function validatePdfFile(file: File): string | null {
  if (file.type !== "application/pdf") return "INVALID_INPUT";
  if (file.size > MAX_PDF_BYTES) return "PDF_TOO_LARGE";
  return null;
}
