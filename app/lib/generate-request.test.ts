import { test, expect } from "vitest";
import { buildGenerateRequest } from "./generate-request";

test("texto → JSON com content-type", () => {
  const init = buildGenerateRequest({ tab: "text", count: 8, text: "oi" });
  expect(init.method).toBe("POST");
  expect((init.headers as Record<string, string>)["content-type"]).toBe(
    "application/json",
  );
  expect(JSON.parse(init.body as string)).toEqual({ text: "oi", count: 8 });
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
});

test("aba pdf sem arquivo cai no JSON (não quebra)", () => {
  const init = buildGenerateRequest({ tab: "pdf", count: 5, text: "" });
  expect(init.body).toBe(JSON.stringify({ text: "", count: 5 }));
});
