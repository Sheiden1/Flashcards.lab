"use client";

import { MAX_TEXT } from "@/app/lib/validation/generate.schema";

export function TextPanel({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, MAX_TEXT))}
        placeholder="Cole seu conteúdo aqui…"
        className="h-48 w-full resize-none rounded-xl border border-primary/30 bg-surface p-4 text-ink outline-none focus:border-primary"
      />
      <p className="mt-1 text-right text-sm text-ink/50">
        {value.length}/{MAX_TEXT}
      </p>
    </div>
  );
}
