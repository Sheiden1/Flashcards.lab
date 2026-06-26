import { DEFAULT_OPTIONS, type GenerateOptions } from "./generate-options";

export type GenerateInput = {
  tab: "text" | "pdf";
  count: number;
  text?: string;
  file?: File;
  options?: GenerateOptions;
};

/**
 * Monta o `RequestInit` para POST /api/generate: multipart quando há um PDF,
 * JSON caso contrário. Função pura (sem fetch) — testável e isola a decisão
 * texto-vs-PDF fora do hook. As opções de geração viajam como JSON em ambos
 * os casos (campo `options` no FormData, chave `options` no corpo JSON).
 */
export function buildGenerateRequest(input: GenerateInput): RequestInit {
  const options = input.options ?? DEFAULT_OPTIONS;

  if (input.tab === "pdf" && input.file) {
    const form = new FormData();
    form.set("file", input.file);
    form.set("count", String(input.count));
    form.set("options", JSON.stringify(options));
    return { method: "POST", body: form };
  }
  return {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text: input.text, count: input.count, options }),
  };
}
