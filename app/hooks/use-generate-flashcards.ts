"use client";

import { useMutation } from "@tanstack/react-query";
import type { GenerateResponse } from "@/types";

type Input = {
  tab: "text" | "pdf";
  count: number;
  text?: string;
  file?: File;
};

async function generate(input: Input): Promise<GenerateResponse> {
  if (input.tab === "pdf" && input.file) {
    const form = new FormData();
    form.set("file", input.file);
    form.set("count", String(input.count));
    const res = await fetch("/api/generate", { method: "POST", body: form });
    return res.json();
  }
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text: input.text, count: input.count }),
  });
  return res.json();
}

export function useGenerateFlashcards() {
  return useMutation({ mutationFn: generate });
}
