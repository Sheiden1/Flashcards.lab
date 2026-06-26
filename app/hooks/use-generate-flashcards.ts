"use client";

import { useMutation } from "@tanstack/react-query";
import type { GenerateResponse } from "@/types";
import {
  buildGenerateRequest,
  type GenerateInput,
} from "@/app/lib/generate-request";

async function generate(input: GenerateInput): Promise<GenerateResponse> {
  const res = await fetch("/api/generate", buildGenerateRequest(input));
  return res.json();
}

export function useGenerateFlashcards() {
  return useMutation({ mutationFn: generate });
}
