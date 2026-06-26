"use client";

import { useState } from "react";
import { Hero } from "./components/landing/Hero";
import { HowItWorks } from "./components/landing/HowItWorks";
import { Footer } from "./components/landing/Footer";
import { GeneratorTabs } from "./components/generator/GeneratorTabs";
import { TextPanel } from "./components/generator/TextPanel";
import { UploadDropzone } from "./components/generator/UploadDropzone";
import { PackOpeningAnimation } from "./components/generator/PackOpeningAnimation";
import { FlashcardDeck } from "./components/generator/FlashcardDeck";
import { ErrorCard } from "./components/generator/ErrorCard";
import { useGeneratorStore } from "./store/generator.store";
import { useGenerateFlashcards } from "./hooks/use-generate-flashcards";
import { SAMPLE_DECK } from "./lib/sample-deck";
import { resolveGenerateResult } from "./lib/generate-result";

export default function Page() {
  const { tab, count, cards, setCount, setCards, setStatus, status } =
    useGeneratorStore();
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const mutation = useGenerateFlashcards();

  async function onGenerate() {
    setStatus("generating");
    setToast(null);
    setCards([]);
    const res = await mutation.mutateAsync({
      tab,
      count,
      text,
      file: file ?? undefined,
    });
    const outcome = resolveGenerateResult(res);
    if (outcome.kind === "deck") {
      setCards(outcome.cards);
      setStatus("success");
    } else {
      setStatus("error");
      setToast(outcome.message);
    }
  }

  function onShowSample() {
    setToast(null);
    setCards(SAMPLE_DECK);
    setStatus("success");
    window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
  }

  const disabled =
    status === "generating" || (tab === "text" ? !text.trim() : !file);

  return (
    <main className="min-h-screen">
      <Hero />
      <section className="mx-auto mt-10 w-[calc(100%-2rem)] max-w-2xl space-y-4 rounded-2xl border border-primary/30 bg-surface/85 p-6 shadow-[0_0_60px_-15px_rgba(124,58,237,0.45)] backdrop-blur-xl">
        <GeneratorTabs />
        {tab === "text" ? (
          <TextPanel value={text} onChange={setText} />
        ) : (
          <UploadDropzone
            file={file}
            onFile={setFile}
            error={fileError}
            onError={setFileError}
          />
        )}
        <div className="flex items-center gap-3">
          <label htmlFor="count-range" className="whitespace-nowrap text-ink/70">
            Cards: {count}
          </label>
          <input
            id="count-range"
            type="range"
            min={5}
            max={20}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            aria-label="Quantidade de cartas a gerar"
            aria-valuetext={`${count} cartas`}
            className="flex-1 accent-primary"
          />
        </div>
        <button
          onClick={onGenerate}
          disabled={disabled}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-semibold text-white transition hover:bg-primary/90 disabled:opacity-40"
        >
          {status === "generating" ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Gerando…
            </>
          ) : (
            "Gerar deck"
          )}
        </button>
        {toast && (
          <ErrorCard message={toast} onDismiss={() => setToast(null)} />
        )}
        <button
          onClick={onShowSample}
          className="w-full text-center text-sm text-ink/50 underline-offset-4 transition hover:text-ink/80 hover:underline"
        >
          ou veja um deck de exemplo
        </button>
        <p className="sr-only" role="status" aria-live="polite">
          {status === "generating"
            ? "Gerando seu deck de flashcards…"
            : status === "success" && cards.length > 0
              ? `Deck gerado com ${cards.length} cartas.`
              : status === "error"
                ? "Erro ao gerar o deck."
                : ""}
        </p>
      </section>
      {status === "generating" && <PackOpeningAnimation />}
      <FlashcardDeck />
      {cards.length === 0 && status !== "generating" && <HowItWorks />}
      <Footer />
    </main>
  );
}
