import { ThemeToggle } from "./ThemeToggle";

export function Hero() {
  return (
    <header className="mx-auto max-w-3xl px-4 pt-10 text-center">
      <div className="flex items-center justify-between">
        <span className="holo-text font-display text-sm font-bold tracking-[0.3em]">
          FLASHCARDS LAB
        </span>
        <ThemeToggle />
      </div>
      <h1 className="mt-16 font-display text-4xl font-bold leading-[1.1] text-ink sm:text-6xl">
        Transforme qualquer conteúdo em{" "}
        <span className="holo-text">cartas de estudo</span>
      </h1>
      <p className="mx-auto mt-5 max-w-md text-ink/75">
        Cole um texto ou envie um PDF. A IA monta seu deck de flashcards —
        cada carta com sua raridade.
      </p>
    </header>
  );
}
