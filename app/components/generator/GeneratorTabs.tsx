"use client";

import { useGeneratorStore } from "@/app/store/generator.store";

export function GeneratorTabs() {
  const tab = useGeneratorStore((s) => s.tab);
  const setTab = useGeneratorStore((s) => s.setTab);

  return (
    <div className="flex gap-2">
      {(["text", "pdf"] as const).map((t) => (
        <button
          key={t}
          onClick={() => setTab(t)}
          className={`rounded-lg px-4 py-2 ${
            tab === t ? "bg-primary text-white" : "bg-surface text-ink/70"
          }`}
        >
          {t === "text" ? "Colar texto" : "Enviar PDF"}
        </button>
      ))}
    </div>
  );
}
