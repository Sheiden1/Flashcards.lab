"use client";

import { useRef } from "react";
import type { Flashcard } from "@/types";
import { useGeneratorStore } from "@/app/store/generator.store";

export function FlashcardCard({
  card,
  index,
}: {
  card: Flashcard;
  index: number;
}) {
  const flipped = useGeneratorStore((s) => s.flipped.has(card.id));
  const toggle = useGeneratorStore((s) => s.toggleFlip);
  const holo = card.rarity === "holographic";
  const ref = useRef<HTMLButtonElement>(null);

  const MAX_TILT = 8; // degrees

  function handlePointer(e: React.PointerEvent<HTMLButtonElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
    el.style.setProperty("--ry", `${(px - 0.5) * 2 * MAX_TILT}deg`);
    el.style.setProperty("--rx", `${-(py - 0.5) * 2 * MAX_TILT}deg`);
  }

  function resetPointer() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--mx", "50%");
    el.style.setProperty("--my", "0%");
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  }

  return (
    <div
      className="card-enter [perspective:1000px]"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <button
        ref={ref}
        onClick={() => toggle(card.id)}
        onPointerMove={handlePointer}
        onPointerLeave={resetPointer}
        className={`card-tilt group relative block h-48 w-full rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-holo focus-visible:ring-offset-2 focus-visible:ring-offset-bg ${
          holo ? "holo-border" : "border border-primary/40"
        }`}
      >
        <div
          className={`relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d] ${
            flipped ? "[transform:rotateY(180deg)]" : ""
          }`}
        >
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-xl bg-surface p-4 text-center [backface-visibility:hidden]">
            {holo && (
            <>
              <span className="holo-foil" aria-hidden />
              <span className="holo-shine" aria-hidden />
              <span className="holo-glare" aria-hidden />
            </>
          )}
            <p className="relative text-ink">{card.question}</p>
            {holo && (
              <span className="absolute right-2 top-2 text-holo">✦</span>
            )}
          </div>
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-xl bg-surface p-4 text-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
            {holo && (
            <>
              <span className="holo-foil" aria-hidden />
              <span className="holo-shine" aria-hidden />
              <span className="holo-glare" aria-hidden />
            </>
          )}
            <p className="relative text-ink/90">{card.answer}</p>
          </div>
        </div>
      </button>
    </div>
  );
}
