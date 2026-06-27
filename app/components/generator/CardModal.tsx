"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { Flashcard } from "@/types";

/**
 * Modal que mostra pergunta e resposta completas de uma carta. Renderizado via
 * portal no <body> para escapar do contexto 3D (`perspective`/`preserve-3d`) do
 * card, que quebraria um overlay `fixed` posicionado dentro dele.
 */
export function CardModal({
  card,
  onClose,
}: {
  card: Flashcard;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Carta expandida"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-primary/40 bg-surface p-6 shadow-[0_0_60px_-15px_rgba(124,58,237,0.6)]"
      >
        <div className="mb-4">
          <p className="text-xs font-medium uppercase tracking-wider text-ink/50">
            Pergunta
          </p>
          <p className="mt-1 whitespace-pre-wrap text-ink">{card.question}</p>
        </div>
        <div className="mb-6">
          <p className="text-xs font-medium uppercase tracking-wider text-ink/50">
            Resposta
          </p>
          <p className="mt-1 whitespace-pre-wrap text-ink/90">{card.answer}</p>
        </div>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="w-full rounded-xl bg-primary py-2.5 font-semibold text-white transition hover:bg-primary/90"
        >
          Fechar
        </button>
      </div>
    </div>,
    document.body,
  );
}
