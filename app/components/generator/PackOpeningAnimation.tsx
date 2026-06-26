export function PackOpeningAnimation() {
  return (
    <div
      className="flex flex-col items-center gap-4 py-12"
      role="status"
      aria-label="Gerando deck"
    >
      <div className="relative h-20 w-20">
        <span className="pack-ring absolute inset-0 rounded-xl border-2 border-holo/60" />
        <span className="pack-ring absolute inset-2 rounded-xl border border-primary/50 [animation-direction:reverse]" />
        <span className="pack-core absolute inset-5 rounded-lg bg-gradient-to-br from-primary to-holo" />
      </div>
      <p className="animate-pulse font-display text-sm tracking-wide text-ink/70">
        Abrindo seu pacote…
      </p>
    </div>
  );
}
