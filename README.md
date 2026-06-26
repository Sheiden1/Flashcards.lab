# Flashcards Lab

## Setup

## Scripts

## Arquitetura

- `app/api/generate/route.ts` — Route Handler fino: valida (Zod) e delega.
- `app/lib/ai/provider.ts` — motor de IA atrás de interface (Gemini hoje).
- `app/lib/parsing/pdf.ts` — extração de texto via `unpdf`.
- `app/lib/rate-limit.ts` — limite por IP em memória (10/hora).
- `app/store/generator.store.ts` — estado de UI (Zustand).
- `app/hooks/use-generate-flashcards.ts` — mutation (TanStack Query).

Veja `docs/superpowers/specs/` e `docs/superpowers/plans/` para spec e plano de implementação.
