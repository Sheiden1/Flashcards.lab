export type GenerateInput = {
  tab: "text" | "pdf";
  count: number;
  text?: string;
  file?: File;
};

/**
 * Monta o `RequestInit` para POST /api/generate: multipart quando há um PDF,
 * JSON caso contrário. Função pura (sem fetch) — testável e isola a decisão
 * texto-vs-PDF fora do hook.
 */
export function buildGenerateRequest(input: GenerateInput): RequestInit {
  if (input.tab === "pdf" && input.file) {
    const form = new FormData();
    form.set("file", input.file);
    form.set("count", String(input.count));
    return { method: "POST", body: form };
  }
  return {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text: input.text, count: input.count }),
  };
}
