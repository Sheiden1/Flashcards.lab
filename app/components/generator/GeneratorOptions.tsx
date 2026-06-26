"use client";

import { useState } from "react";
import { useGeneratorStore } from "@/app/store/generator.store";
import {
  CARD_TYPE_OPTIONS,
  DEPTH_OPTIONS,
  DIFFICULTY_OPTIONS,
  FOCUS_OPTIONS,
  summarizeOptions,
  type GenerateOptions,
} from "@/app/lib/generate-options";

type OptionGroupProps<K extends keyof GenerateOptions> = {
  label: string;
  optionKey: K;
  choices: { value: GenerateOptions[K]; label: string }[];
};

function OptionGroup<K extends keyof GenerateOptions>({
  label,
  optionKey,
  choices,
}: OptionGroupProps<K>) {
  const value = useGeneratorStore((s) => s.options[optionKey]);
  const setOption = useGeneratorStore((s) => s.setOption);

  return (
    <fieldset>
      <legend className="mb-2 text-xs font-medium uppercase tracking-wider text-ink/50">
        {label}
      </legend>
      <div className="flex flex-wrap gap-2">
        {choices.map((choice) => {
          const active = choice.value === value;
          return (
            <button
              key={choice.value}
              type="button"
              aria-pressed={active}
              onClick={() => setOption(optionKey, choice.value)}
              className={`rounded-lg border px-3 py-1.5 text-sm transition ${
                active
                  ? "border-primary bg-primary/20 text-ink shadow-[0_0_18px_-6px_rgba(124,58,237,0.7)]"
                  : "border-primary/20 bg-surface/60 text-ink/60 hover:border-primary/50 hover:text-ink/90"
              }`}
            >
              {choice.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function GeneratorOptions() {
  const [open, setOpen] = useState(false);
  const options = useGeneratorStore((s) => s.options);

  return (
    <div className="rounded-xl border border-primary/15 bg-surface/40">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="generator-options-panel"
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="min-w-0">
          <span className="flex items-center gap-2">
            <span className="text-sm font-medium text-ink/90">
              Personalizar flashcards
            </span>
            <span className="text-xs text-ink/45">opcional</span>
          </span>
          {!open && (
            <span className="mt-0.5 block truncate text-xs text-ink/50">
              {summarizeOptions(options)}
            </span>
          )}
        </span>
        <svg
          viewBox="0 0 24 24"
          className={`h-4 w-4 shrink-0 text-ink/50 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div
          id="generator-options-panel"
          className="grid gap-4 border-t border-primary/10 p-4 sm:grid-cols-2"
        >
          <OptionGroup
            label="Profundidade"
            optionKey="depth"
            choices={DEPTH_OPTIONS}
          />
          <OptionGroup
            label="Dificuldade"
            optionKey="difficulty"
            choices={DIFFICULTY_OPTIONS}
          />
          <OptionGroup
            label="Tipo de card"
            optionKey="cardType"
            choices={CARD_TYPE_OPTIONS}
          />
          <OptionGroup
            label="Foco do deck"
            optionKey="focus"
            choices={FOCUS_OPTIONS}
          />
        </div>
      )}
    </div>
  );
}
