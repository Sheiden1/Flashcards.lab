"use client";

export function ErrorCard({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  return (
    <div
      role="alert"
      className="card-enter relative overflow-hidden rounded-xl border border-holo/50 bg-surface p-5 text-center"
    >
      <div className="mb-2 text-2xl text-holo">⚠</div>
      <p className="text-ink">{message}</p>
      <button
        onClick={onDismiss}
        className="mt-4 rounded-lg border border-primary/50 px-4 py-1.5 text-sm text-ink/80 transition hover:bg-primary hover:text-white"
      >
        Tentar de novo
      </button>
    </div>
  );
}
