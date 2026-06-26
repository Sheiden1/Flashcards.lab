"use client";

import { validatePdfFile } from "@/app/lib/validation/generate.schema";

export function UploadDropzone({
  file,
  onFile,
  error,
  onError,
}: {
  file: File | null;
  onFile: (f: File | null) => void;
  error: string | null;
  onError: (e: string | null) => void;
}) {
  function handle(f: File | null) {
    if (!f) return onFile(null);
    const err = validatePdfFile(f);
    if (err) {
      onError(err === "PDF_TOO_LARGE" ? "PDF acima de 2MB." : "Envie um PDF válido.");
      onFile(null);
      return;
    }
    onError(null);
    onFile(f);
  }

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        handle(e.dataTransfer.files[0] ?? null);
      }}
      className="flex h-48 flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary/40 bg-surface text-ink/70"
    >
      <input
        type="file"
        accept="application/pdf"
        id="pdf"
        className="hidden"
        onChange={(e) => handle(e.target.files?.[0] ?? null)}
      />
      <label
        htmlFor="pdf"
        className="cursor-pointer rounded-lg bg-primary px-4 py-2 text-white"
      >
        Escolher PDF
      </label>
      <p className="mt-2 text-sm">
        {file ? file.name : "ou arraste aqui — tamanho máximo 2 MB"}
      </p>
      {!file && (
        <p className="mt-1 text-xs text-ink/50">
          Acima de 2 MB? Comprima em{" "}
          <a
            href="https://www.ilovepdf.com/pt/comprimir_pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-2 hover:text-holo"
            onClick={(e) => e.stopPropagation()}
          >
            iLovePDF
          </a>
          .
        </p>
      )}
      {error && <p className="mt-1 text-sm text-holo">{error}</p>}
    </div>
  );
}
