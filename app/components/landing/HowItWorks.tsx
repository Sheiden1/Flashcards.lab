const STEPS = [
  {
    n: "01",
    title: "Cole ou envie",
    desc: "Texto colado ou um PDF de até 2MB. Qualquer conteúdo serve.",
  },
  {
    n: "02",
    title: "A IA monta o deck",
    desc: "O Gemini extrai os pontos-chave e gera perguntas e respostas.",
  },
  {
    n: "03",
    title: "Estude as cartas",
    desc: "Vire cada carta para revisar. Uma vem holográfica — a rara do deck.",
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16">
      <h2 className="mb-10 text-center font-display text-2xl font-bold text-ink">
        Como funciona
      </h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {STEPS.map((s) => (
          <div
            key={s.n}
            className="rounded-xl border border-primary/25 bg-surface/80 p-6 backdrop-blur-md"
          >
            <div className="holo-text font-display text-3xl font-bold">
              {s.n}
            </div>
            <h3 className="mt-3 font-display text-lg font-semibold text-ink">
              {s.title}
            </h3>
            <p className="mt-2 text-sm text-ink/70">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
