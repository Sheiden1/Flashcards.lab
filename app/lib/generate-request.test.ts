import { test, expect } from "vitest";
import { buildGenerateRequest } from "./generate-request";
import { DEFAULT_OPTIONS } from "./generate-options";

test("texto → JSON com content-type", () => {
  const init = buildGenerateRequest({ tab: "text", count: 8, text: "oi" });
  expect(init.method).toBe("POST");
  expect((init.headers as Record<string, string>)["content-type"]).toBe(
    "application/json",
  );
  expect(JSON.parse(init.body as string)).toEqual({
    text: "oi",
    count: 8,
    options: DEFAULT_OPTIONS,
  });
});

test("texto → inclui as opções escolhidas no corpo JSON", () => {
  const options = {
    depth: "completo" as const,
    cardType: "multipla" as const,
    difficulty: "avancado" as const,
    focus: "concurso" as const,
  };
  const init = buildGenerateRequest({ tab: "text", count: 8, text: "oi", options });
  expect(JSON.parse(init.body as string).options).toEqual(options);
});

test("PDF com arquivo → multipart FormData (sem content-type manual)", () => {
  const file = new File([new Uint8Array(4)], "x.pdf", {
    type: "application/pdf",
  });
  const init = buildGenerateRequest({ tab: "pdf", count: 5, file });
  expect(init.method).toBe("POST");
  expect(init.headers).toBeUndefined();
  expect(init.body).toBeInstanceOf(FormData);
  const form = init.body as FormData;
  expect(form.get("count")).toBe("5");
  expect(form.get("file")).toBeInstanceOf(File);
  expect(JSON.parse(form.get("options") as string)).toEqual(DEFAULT_OPTIONS);
});

test("aba pdf sem arquivo cai no JSON (não quebra)", () => {
  const init = buildGenerateRequest({ tab: "pdf", count: 5, text: "" });
  expect(init.body).toBe(
    JSON.stringify({ text: "", count: 5, options: DEFAULT_OPTIONS }),
  );
});
