# Flashcards Lab

Landing page única que gera flashcards a partir de PDF (≤2MB) ou texto colado, usando a Gemini API. Next.js 16 (App Router) + TypeScript. Fluxo stateless — gera o deck e mostra na tela, nada persiste entre sessões.

## Setup

1. `pnpm install`
2. Copie `.env.example` para `.env.local` e preencha `GEMINI_API_KEY` (gerada em https://aistudio.google.com).
3. `pnpm dev` → http://localhost:3000

## Scripts

- `pnpm dev` — servidor de desenvolvimento
- `pnpm build` — build de produção
- `pnpm test` — suíte de testes (Vitest)
- `pnpm lint` — ESLint

## Arquitetura

- `app/api/generate/route.ts` — Route Handler fino: valida (Zod) e delega.
- `app/lib/ai/provider.ts` — motor de IA atrás de interface (Gemini hoje).
- `app/lib/parsing/pdf.ts` — extração de texto via `unpdf`.
- `app/lib/rate-limit.ts` — limite por IP em memória (10/hora).
- `app/store/generator.store.ts` — estado de UI (Zustand).
- `app/hooks/use-generate-flashcards.ts` — mutation (TanStack Query).

Veja `docs/superpowers/specs/` e `docs/superpowers/plans/` para spec e plano de implementação.
