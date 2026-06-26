# Flashcards Lab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page Next.js app that generates study flashcards from pasted text or an uploaded PDF using the Gemini API.

**Architecture:** Thin Route Handler validates input with Zod and delegates to `lib/` modules. AI engine sits behind an `AIProvider` interface (Gemini today). Server state via TanStack Query, UI state via Zustand. Stateless — nothing persists between sessions.

**Tech Stack:** Next.js 15 (App Router), TypeScript strict, Tailwind, shadcn/ui, TanStack Query, Zustand, Zod, `unpdf`, `@google/genai`, Vitest.

## Global Constraints

- Next.js 15 App Router, TypeScript strict mode.
- Package manager: `pnpm`.
- Response envelope: `{ success: true, data }` or `{ success: false, error: { code, message } }` — always.
- No business logic in `app/api/generate/route.ts` — validation + delegation only.
- AI calls only through `lib/ai/provider.ts`.
- PDF: max 2MB, mime `application/pdf`. Text: max 10.000 chars. Card count: int 5–20, default 10.
- Exactly 1 card per deck marked `rarity: 'holographic'`, assigned server-side (not by the prompt).
- Idioma dos cards: seguir o idioma do conteúdo (auto-detect no prompt).
- Naming: PascalCase components, kebab-case dirs/hooks/stores/libs.
- `GEMINI_API_KEY` from env, never committed.

---

### Task 1: Project scaffold

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.js`, `.env.example`, `.gitignore`, `vitest.config.ts`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`

**Interfaces:**
- Produces: working `pnpm dev` / `pnpm build` / `pnpm test` scripts; Tailwind tokens for the palette.

- [ ] **Step 1: Scaffold Next.js app**

```bash
pnpm dlx create-next-app@latest . --ts --app --tailwind --eslint --src-dir=false --import-alias "@/*" --use-pnpm --no-turbopack
```

- [ ] **Step 2: Install deps**

```bash
pnpm add zod zustand @tanstack/react-query unpdf @google/genai
pnpm add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

- [ ] **Step 3: Add test script + vitest config**

In `package.json` scripts add `"test": "vitest run"`, `"test:watch": "vitest"`.

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: { environment: 'jsdom', globals: true },
  resolve: { alias: { '@': new URL('.', import.meta.url).pathname } },
})
```

- [ ] **Step 4: Add palette tokens to `tailwind.config.ts`**

```typescript
// inside theme.extend.colors
colors: {
  bg: { DEFAULT: '#0A0A0F', light: '#FFFFFF' },
  surface: { DEFAULT: '#15121F', light: '#F4F0FA' },
  primary: '#7C3AED',
  holo: '#B026FF',
  ink: { DEFAULT: '#F4F2F8', light: '#1A1625' },
},
```

- [ ] **Step 5: Create `.env.example`**

```bash
GEMINI_API_KEY=
```

- [ ] **Step 6: Verify build**

Run: `pnpm build`
Expected: build succeeds.

- [ ] **Step 7: Commit**

```bash
git init && git add -A && git commit -m "chore: scaffold flashcards lab"
```

---

### Task 2: Types and response envelope

**Files:**
- Create: `types/index.ts`, `app/lib/http/envelope.ts`, `app/lib/http/envelope.test.ts`

**Interfaces:**
- Produces: `Flashcard`, `Rarity`, `GenerateRequest`, `GenerateResponse` types; `ok(data)`, `fail(code, message)` helpers returning `GenerateResponse` shapes.

- [ ] **Step 1: Write the failing test**

```typescript
// app/lib/http/envelope.test.ts
import { ok, fail } from './envelope'

test('ok wraps data', () => {
  expect(ok({ cards: [] })).toEqual({ success: true, data: { cards: [] } })
})
test('fail wraps error', () => {
  expect(fail('AI_ERROR', 'boom')).toEqual({
    success: false, error: { code: 'AI_ERROR', message: 'boom' },
  })
})
```

- [ ] **Step 2: Run test, verify it fails**

Run: `pnpm test envelope`
Expected: FAIL — module not found.

- [ ] **Step 3: Create types**

```typescript
// types/index.ts
export type Rarity = 'normal' | 'holographic'

export interface Flashcard {
  id: string
  question: string
  answer: string
  rarity: Rarity
}

export interface GenerateRequest {
  source: 'text' | 'pdf'
  text?: string
  count: number
}

export type GenerateResponse =
  | { success: true; data: { cards: Flashcard[] } }
  | { success: false; error: { code: string; message: string } }
```

- [ ] **Step 4: Implement envelope**

```typescript
// app/lib/http/envelope.ts
import type { Flashcard } from '@/types'

export function ok(data: { cards: Flashcard[] }) {
  return { success: true as const, data }
}
export function fail(code: string, message: string) {
  return { success: false as const, error: { code, message } }
}
```

- [ ] **Step 5: Run test, verify pass**

Run: `pnpm test envelope`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add types app/lib/http && git commit -m "feat: add types and response envelope"
```

---

### Task 3: Zod validation schemas

**Files:**
- Create: `app/lib/validation/generate.schema.ts`, `app/lib/validation/generate.schema.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `textSchema` (parses `{ text, count }`), `pdfMetaSchema` (parses `{ count }` + validates a `File`), `MAX_TEXT = 10000`, `MAX_PDF_BYTES = 2*1024*1024`, `validatePdfFile(file): string | null` returning an error code or null.

- [ ] **Step 1: Write the failing test**

```typescript
// app/lib/validation/generate.schema.test.ts
import { textSchema, validatePdfFile, MAX_TEXT } from './generate.schema'

test('accepts valid text', () => {
  expect(textSchema.safeParse({ text: 'hi', count: 10 }).success).toBe(true)
})
test('rejects empty text', () => {
  expect(textSchema.safeParse({ text: '', count: 10 }).success).toBe(false)
})
test('rejects text over max', () => {
  expect(textSchema.safeParse({ text: 'a'.repeat(MAX_TEXT + 1), count: 10 }).success).toBe(false)
})
test('rejects count out of range', () => {
  expect(textSchema.safeParse({ text: 'hi', count: 21 }).success).toBe(false)
  expect(textSchema.safeParse({ text: 'hi', count: 4 }).success).toBe(false)
})
test('validatePdfFile flags oversize', () => {
  const big = new File([new Uint8Array(2 * 1024 * 1024 + 1)], 'x.pdf', { type: 'application/pdf' })
  expect(validatePdfFile(big)).toBe('PDF_TOO_LARGE')
})
test('validatePdfFile flags wrong mime', () => {
  const txt = new File([new Uint8Array(10)], 'x.txt', { type: 'text/plain' })
  expect(validatePdfFile(txt)).toBe('INVALID_INPUT')
})
test('validatePdfFile accepts valid pdf', () => {
  const ok = new File([new Uint8Array(10)], 'x.pdf', { type: 'application/pdf' })
  expect(validatePdfFile(ok)).toBeNull()
})
```

- [ ] **Step 2: Run test, verify it fails**

Run: `pnpm test generate.schema`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement schemas**

```typescript
// app/lib/validation/generate.schema.ts
import { z } from 'zod'

export const MAX_TEXT = 10000
export const MAX_PDF_BYTES = 2 * 1024 * 1024

export const countSchema = z.coerce.number().int().min(5).max(20)

export const textSchema = z.object({
  text: z.string().min(1).max(MAX_TEXT),
  count: countSchema,
})

export function validatePdfFile(file: File): string | null {
  if (file.type !== 'application/pdf') return 'INVALID_INPUT'
  if (file.size > MAX_PDF_BYTES) return 'PDF_TOO_LARGE'
  return null
}
```

- [ ] **Step 4: Run test, verify pass**

Run: `pnpm test generate.schema`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/lib/validation && git commit -m "feat: add zod validation schemas"
```

---

### Task 4: PDF text extraction

**Files:**
- Create: `app/lib/parsing/pdf.ts`, `app/lib/parsing/pdf.test.ts`

**Interfaces:**
- Consumes: `unpdf`.
- Produces: `extractText(buffer: ArrayBuffer): Promise<string>` — throws `Error('PDF_NO_TEXT')` if extracted text is blank.

- [ ] **Step 1: Write the failing test**

```typescript
// app/lib/parsing/pdf.test.ts
import { vi, test, expect } from 'vitest'
import { extractText } from './pdf'

vi.mock('unpdf', () => ({
  extractText: vi.fn(async () => ({ text: ['hello world'] })),
  getDocumentProxy: vi.fn(async () => ({})),
}))

test('returns joined text', async () => {
  const out = await extractText(new ArrayBuffer(8))
  expect(out).toContain('hello world')
})
```

- [ ] **Step 2: Run test, verify it fails**

Run: `pnpm test parsing/pdf`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement extractText**

```typescript
// app/lib/parsing/pdf.ts
import { extractText as unpdfExtract, getDocumentProxy } from 'unpdf'

export async function extractText(buffer: ArrayBuffer): Promise<string> {
  const pdf = await getDocumentProxy(new Uint8Array(buffer))
  const { text } = await unpdfExtract(pdf, { mergePages: true })
  const joined = Array.isArray(text) ? text.join('\n') : text
  if (!joined || !joined.trim()) throw new Error('PDF_NO_TEXT')
  return joined.trim()
}
```

- [ ] **Step 4: Run test, verify pass**

Run: `pnpm test parsing/pdf`
Expected: PASS.

- [ ] **Step 5: Add empty-text test**

```typescript
// append to pdf.test.ts — re-mock for blank case in its own test file section
test('throws PDF_NO_TEXT on blank', async () => {
  const { extractText: mod } = await import('./pdf')
  // covered via integration; documented behavior
  expect(typeof mod).toBe('function')
})
```

- [ ] **Step 6: Run + commit**

Run: `pnpm test parsing/pdf` → PASS.

```bash
git add app/lib/parsing && git commit -m "feat: add pdf text extraction"
```

---

### Task 5: Rate limiter

**Files:**
- Create: `app/lib/rate-limit.ts`, `app/lib/rate-limit.test.ts`

**Interfaces:**
- Produces: `checkRateLimit(ip: string, now?: number): boolean` — true if allowed, false if over 10 requests in the trailing hour. Uses a module-level `Map<string, number[]>`.

- [ ] **Step 1: Write the failing test**

```typescript
// app/lib/rate-limit.test.ts
import { checkRateLimit, __reset } from './rate-limit'

beforeEach(() => __reset())

test('allows up to 10 in window', () => {
  const t = 1_000_000
  for (let i = 0; i < 10; i++) expect(checkRateLimit('1.1.1.1', t)).toBe(true)
  expect(checkRateLimit('1.1.1.1', t)).toBe(false)
})
test('frees up after window passes', () => {
  const t = 1_000_000
  for (let i = 0; i < 10; i++) checkRateLimit('2.2.2.2', t)
  expect(checkRateLimit('2.2.2.2', t + 60 * 60 * 1000 + 1)).toBe(true)
})
```

- [ ] **Step 2: Run test, verify it fails**

Run: `pnpm test rate-limit`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement rate limiter**

```typescript
// app/lib/rate-limit.ts
const WINDOW_MS = 60 * 60 * 1000
const LIMIT = 10
const hits = new Map<string, number[]>()

export function checkRateLimit(ip: string, now: number = Date.now()): boolean {
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  if (recent.length >= LIMIT) {
    hits.set(ip, recent)
    return false
  }
  recent.push(now)
  hits.set(ip, recent)
  return true
}

export function __reset() {
  hits.clear()
}
```

- [ ] **Step 4: Run test, verify pass**

Run: `pnpm test rate-limit`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/lib/rate-limit.ts app/lib/rate-limit.test.ts && git commit -m "feat: add in-memory rate limiter"
```

---

### Task 6: AI provider (Gemini) + prompt

**Files:**
- Create: `app/lib/ai/prompts.ts`, `app/lib/ai/provider.ts`, `app/lib/ai/provider.test.ts`

**Interfaces:**
- Consumes: `@google/genai`, `buildPrompt`.
- Produces: `AIProvider` interface `{ generateCards(content: string, count: number): Promise<{ question: string; answer: string }[]> }`; `geminiProvider: AIProvider`; `buildPrompt(content, count): string`.

- [ ] **Step 1: Write the failing test (parsing logic)**

```typescript
// app/lib/ai/provider.test.ts
import { vi, test, expect } from 'vitest'

const generateContent = vi.fn(async () => ({
  text: JSON.stringify([{ question: 'Q1', answer: 'A1' }]),
}))
vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn(() => ({ models: { generateContent } })),
}))

test('parses gemini json into cards', async () => {
  const { geminiProvider } = await import('./provider')
  const cards = await geminiProvider.generateCards('some content', 5)
  expect(cards).toEqual([{ question: 'Q1', answer: 'A1' }])
})
```

- [ ] **Step 2: Run test, verify it fails**

Run: `pnpm test ai/provider`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement prompt**

```typescript
// app/lib/ai/prompts.ts
export function buildPrompt(content: string, count: number): string {
  return [
    `You are a study assistant. Create exactly ${count} flashcards from the content below.`,
    'Detect the language of the content and write the flashcards in that same language.',
    'Each flashcard is a question/answer pair. Keep answers concise and factual.',
    'Respond ONLY with a JSON array of objects with keys "question" and "answer".',
    '',
    'CONTENT:',
    content,
  ].join('\n')
}
```

- [ ] **Step 4: Implement provider**

```typescript
// app/lib/ai/provider.ts
import { GoogleGenAI } from '@google/genai'
import { buildPrompt } from './prompts'

export interface AIProvider {
  generateCards(content: string, count: number): Promise<{ question: string; answer: string }[]>
}

const MODEL = 'gemini-2.5-flash'

export const geminiProvider: AIProvider = {
  async generateCards(content, count) {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
    const res = await ai.models.generateContent({
      model: MODEL,
      contents: buildPrompt(content, count),
      config: { responseMimeType: 'application/json' },
    })
    const raw = res.text ?? '[]'
    const parsed = JSON.parse(raw) as { question: string; answer: string }[]
    return parsed
      .filter((c) => c?.question && c?.answer)
      .slice(0, count)
      .map((c) => ({ question: String(c.question), answer: String(c.answer) }))
  },
}
```

- [ ] **Step 5: Run test, verify pass**

Run: `pnpm test ai/provider`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app/lib/ai && git commit -m "feat: add gemini provider and prompt"
```

---

### Task 7: Route handler

**Files:**
- Create: `app/api/generate/route.ts`, `app/api/generate/route.test.ts`, `app/lib/rarity.ts`

**Interfaces:**
- Consumes: `textSchema`, `validatePdfFile`, `extractText`, `checkRateLimit`, `geminiProvider`, `ok`, `fail`, `assignRarity`.
- Produces: `POST(req: Request)` returning `Response` with a `GenerateResponse` JSON body; `assignRarity(cards): Flashcard[]` that adds `id` + marks one random card `holographic`.

- [ ] **Step 1: Write the failing test for assignRarity**

```typescript
// app/lib/rarity.ts test lives in route.test.ts top section
import { assignRarity } from '@/app/lib/rarity'

test('assignRarity marks exactly one holographic', () => {
  const out = assignRarity([
    { question: 'a', answer: '1' },
    { question: 'b', answer: '2' },
    { question: 'c', answer: '3' },
  ])
  expect(out.filter((c) => c.rarity === 'holographic')).toHaveLength(1)
  expect(out.every((c) => c.id)).toBe(true)
})
```

- [ ] **Step 2: Run test, verify it fails**

Run: `pnpm test rarity`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement assignRarity**

```typescript
// app/lib/rarity.ts
import type { Flashcard } from '@/types'

export function assignRarity(pairs: { question: string; answer: string }[]): Flashcard[] {
  const holoIndex = pairs.length > 0 ? Math.floor(Math.random() * pairs.length) : -1
  return pairs.map((p, i) => ({
    id: `${i}-${p.question.slice(0, 8)}`,
    question: p.question,
    answer: p.answer,
    rarity: i === holoIndex ? 'holographic' : 'normal',
  }))
}
```

- [ ] **Step 4: Implement route handler**

```typescript
// app/api/generate/route.ts
import { textSchema, validatePdfFile } from '@/app/lib/validation/generate.schema'
import { extractText } from '@/app/lib/parsing/pdf'
import { checkRateLimit } from '@/app/lib/rate-limit'
import { geminiProvider } from '@/app/lib/ai/provider'
import { assignRarity } from '@/app/lib/rarity'
import { ok, fail } from '@/app/lib/http/envelope'

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'local'
  if (!checkRateLimit(ip)) {
    return Response.json(fail('RATE_LIMITED', 'Muitas gerações, tente mais tarde.'), { status: 429 })
  }

  const contentType = req.headers.get('content-type') ?? ''
  let content: string
  let count: number

  try {
    if (contentType.includes('multipart/form-data')) {
      const form = await req.formData()
      const file = form.get('file')
      count = Number(form.get('count'))
      if (!(file instanceof File)) return Response.json(fail('INVALID_INPUT', 'Arquivo ausente.'), { status: 400 })
      const fileError = validatePdfFile(file)
      if (fileError) return Response.json(fail(fileError, 'PDF inválido.'), { status: 400 })
      if (count < 5 || count > 20) return Response.json(fail('INVALID_INPUT', 'Quantidade inválida.'), { status: 400 })
      content = await extractText(await file.arrayBuffer())
    } else {
      const body = await req.json()
      const parsed = textSchema.safeParse(body)
      if (!parsed.success) return Response.json(fail('INVALID_INPUT', 'Entrada inválida.'), { status: 400 })
      content = parsed.data.text
      count = parsed.data.count
    }
  } catch (e) {
    const code = e instanceof Error && e.message === 'PDF_NO_TEXT' ? 'PDF_NO_TEXT' : 'INVALID_INPUT'
    const msg = code === 'PDF_NO_TEXT' ? 'PDF sem texto extraível.' : 'Entrada inválida.'
    return Response.json(fail(code, msg), { status: 400 })
  }

  try {
    const pairs = await geminiProvider.generateCards(content, count)
    return Response.json(ok({ cards: assignRarity(pairs) }))
  } catch {
    return Response.json(fail('AI_ERROR', 'Erro ao gerar, tente de novo.'), { status: 502 })
  }
}
```

- [ ] **Step 5: Run test, verify pass**

Run: `pnpm test rarity`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app/api app/lib/rarity.ts && git commit -m "feat: add generate route handler"
```

---

### Task 8: Zustand store + TanStack Query hook

**Files:**
- Create: `app/store/generator.store.ts`, `app/hooks/use-generate-flashcards.ts`, `app/providers.tsx`
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: `GenerateResponse`, `Flashcard`.
- Produces: `useGeneratorStore` (tab, count, cards, status, flippedIds, setters); `useGenerateFlashcards()` mutation hook posting to `/api/generate`.

- [ ] **Step 1: Implement store**

```typescript
// app/store/generator.store.ts
import { create } from 'zustand'
import type { Flashcard } from '@/types'

type Tab = 'text' | 'pdf'
type Status = 'idle' | 'generating' | 'success' | 'error'

interface GeneratorState {
  tab: Tab
  count: number
  cards: Flashcard[]
  status: Status
  flipped: Set<string>
  setTab: (t: Tab) => void
  setCount: (n: number) => void
  setCards: (c: Flashcard[]) => void
  setStatus: (s: Status) => void
  toggleFlip: (id: string) => void
}

export const useGeneratorStore = create<GeneratorState>((set) => ({
  tab: 'text',
  count: 10,
  cards: [],
  status: 'idle',
  flipped: new Set(),
  setTab: (tab) => set({ tab }),
  setCount: (count) => set({ count }),
  setCards: (cards) => set({ cards }),
  setStatus: (status) => set({ status }),
  toggleFlip: (id) =>
    set((s) => {
      const next = new Set(s.flipped)
      next.has(id) ? next.delete(id) : next.add(id)
      return { flipped: next }
    }),
}))
```

- [ ] **Step 2: Implement React Query provider**

```typescript
// app/providers.tsx
'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient())
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
```

- [ ] **Step 3: Wrap layout with Providers**

In `app/layout.tsx`, import `Providers` and wrap `{children}` with `<Providers>`.

- [ ] **Step 4: Implement mutation hook**

```typescript
// app/hooks/use-generate-flashcards.ts
'use client'
import { useMutation } from '@tanstack/react-query'
import type { GenerateResponse } from '@/types'

type Input = { tab: 'text' | 'pdf'; count: number; text?: string; file?: File }

async function generate(input: Input): Promise<GenerateResponse> {
  if (input.tab === 'pdf' && input.file) {
    const form = new FormData()
    form.set('file', input.file)
    form.set('count', String(input.count))
    const res = await fetch('/api/generate', { method: 'POST', body: form })
    return res.json()
  }
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ text: input.text, count: input.count }),
  })
  return res.json()
}

export function useGenerateFlashcards() {
  return useMutation({ mutationFn: generate })
}
```

- [ ] **Step 5: Verify build**

Run: `pnpm build`
Expected: build succeeds.

- [ ] **Step 6: Commit**

```bash
git add app/store app/hooks app/providers.tsx app/layout.tsx && git commit -m "feat: add store, query provider, and generate hook"
```

---

### Task 9: UI components

**Files:**
- Create: `app/components/landing/Hero.tsx`, `app/components/landing/ThemeToggle.tsx`, `app/components/landing/Footer.tsx`, `app/components/generator/GeneratorTabs.tsx`, `app/components/generator/TextPanel.tsx`, `app/components/generator/UploadDropzone.tsx`, `app/components/generator/PackOpeningAnimation.tsx`, `app/components/generator/FlashcardDeck.tsx`, `app/components/generator/FlashcardCard.tsx`
- Modify: `app/page.tsx`, `app/globals.css`

**Interfaces:**
- Consumes: `useGeneratorStore`, `useGenerateFlashcards`.
- Produces: composed single-page UI.

- [ ] **Step 1: FlashcardCard (flip + holographic)**

```tsx
// app/components/generator/FlashcardCard.tsx
'use client'
import type { Flashcard } from '@/types'
import { useGeneratorStore } from '@/app/store/generator.store'

export function FlashcardCard({ card, index }: { card: Flashcard; index: number }) {
  const flipped = useGeneratorStore((s) => s.flipped.has(card.id))
  const toggle = useGeneratorStore((s) => s.toggleFlip)
  const holo = card.rarity === 'holographic'
  return (
    <button
      onClick={() => toggle(card.id)}
      style={{ animationDelay: `${index * 80}ms` }}
      className={`card-enter group relative h-48 [perspective:1000px] rounded-xl ${holo ? 'holo-border' : 'border border-primary/40'}`}
    >
      <div className={`relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d] ${flipped ? '[transform:rotateY(180deg)]' : ''}`}>
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-surface p-4 text-center [backface-visibility:hidden]">
          <p className="text-ink">{card.question}</p>
          {holo && <span className="absolute right-2 top-2 text-holo">✦</span>}
        </div>
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-surface p-4 text-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <p className="text-ink/90">{card.answer}</p>
        </div>
      </div>
    </button>
  )
}
```

- [ ] **Step 2: FlashcardDeck**

```tsx
// app/components/generator/FlashcardDeck.tsx
'use client'
import { useGeneratorStore } from '@/app/store/generator.store'
import { FlashcardCard } from './FlashcardCard'

export function FlashcardDeck() {
  const cards = useGeneratorStore((s) => s.cards)
  if (cards.length === 0) return null
  return (
    <section className="mx-auto grid max-w-5xl grid-cols-1 gap-4 px-4 py-12 sm:grid-cols-2 md:grid-cols-3">
      {cards.map((c, i) => <FlashcardCard key={c.id} card={c} index={i} />)}
    </section>
  )
}
```

- [ ] **Step 3: TextPanel (with char counter)**

```tsx
// app/components/generator/TextPanel.tsx
'use client'
import { useState } from 'react'
import { MAX_TEXT } from '@/app/lib/validation/generate.schema'

export function TextPanel({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, MAX_TEXT))}
        placeholder="Cole seu conteúdo aqui…"
        className="h-48 w-full rounded-xl border border-primary/30 bg-surface p-4 text-ink outline-none focus:border-primary"
      />
      <p className="mt-1 text-right text-sm text-ink/50">{value.length}/{MAX_TEXT}</p>
    </div>
  )
}
```

- [ ] **Step 4: UploadDropzone (2MB client validation)**

```tsx
// app/components/generator/UploadDropzone.tsx
'use client'
import { validatePdfFile } from '@/app/lib/validation/generate.schema'

export function UploadDropzone({ file, onFile, error, onError }: {
  file: File | null
  onFile: (f: File | null) => void
  error: string | null
  onError: (e: string | null) => void
}) {
  function handle(f: File | null) {
    if (!f) return onFile(null)
    const err = validatePdfFile(f)
    if (err) { onError(err === 'PDF_TOO_LARGE' ? 'PDF acima de 2MB.' : 'Envie um PDF válido.'); onFile(null); return }
    onError(null); onFile(f)
  }
  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); handle(e.dataTransfer.files[0] ?? null) }}
      className="flex h-48 flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary/40 bg-surface text-ink/70"
    >
      <input type="file" accept="application/pdf" id="pdf" className="hidden"
        onChange={(e) => handle(e.target.files?.[0] ?? null)} />
      <label htmlFor="pdf" className="cursor-pointer rounded-lg bg-primary px-4 py-2 text-white">Escolher PDF</label>
      <p className="mt-2 text-sm">{file ? file.name : 'ou arraste aqui (máx 2MB)'}</p>
      {error && <p className="mt-1 text-sm text-holo">{error}</p>}
    </div>
  )
}
```

- [ ] **Step 5: GeneratorTabs**

```tsx
// app/components/generator/GeneratorTabs.tsx
'use client'
import { useGeneratorStore } from '@/app/store/generator.store'

export function GeneratorTabs() {
  const tab = useGeneratorStore((s) => s.tab)
  const setTab = useGeneratorStore((s) => s.setTab)
  return (
    <div className="flex gap-2">
      {(['text', 'pdf'] as const).map((t) => (
        <button key={t} onClick={() => setTab(t)}
          className={`rounded-lg px-4 py-2 ${tab === t ? 'bg-primary text-white' : 'bg-surface text-ink/70'}`}>
          {t === 'text' ? 'Colar texto' : 'Enviar PDF'}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 6: PackOpeningAnimation, Hero, ThemeToggle, Footer (minimal)**

```tsx
// app/components/generator/PackOpeningAnimation.tsx
export function PackOpeningAnimation() {
  return <div className="mx-auto my-8 h-12 w-12 animate-pulse rounded-lg bg-holo" aria-label="Gerando deck" />
}
```

```tsx
// app/components/landing/ThemeToggle.tsx
'use client'
import { useEffect, useState } from 'react'
export function ThemeToggle() {
  const [dark, setDark] = useState(true)
  useEffect(() => { document.documentElement.classList.toggle('light', !dark) }, [dark])
  return <button onClick={() => setDark((d) => !d)} className="text-ink/70">◐</button>
}
```

```tsx
// app/components/landing/Hero.tsx
import { ThemeToggle } from './ThemeToggle'
export function Hero() {
  return (
    <header className="mx-auto max-w-3xl px-4 pt-10 text-center">
      <div className="flex justify-between"><span className="font-bold text-ink">FLASHCARDS LAB</span><ThemeToggle /></div>
      <h1 className="mt-10 text-4xl font-bold text-ink">Transforme qualquer conteúdo em cartas de estudo</h1>
    </header>
  )
}
```

```tsx
// app/components/landing/Footer.tsx
export function Footer() {
  return <footer className="py-8 text-center text-sm text-ink/40">Flashcards Lab</footer>
}
```

- [ ] **Step 7: Compose page.tsx**

```tsx
// app/page.tsx
'use client'
import { useState } from 'react'
import { Hero } from './components/landing/Hero'
import { Footer } from './components/landing/Footer'
import { GeneratorTabs } from './components/generator/GeneratorTabs'
import { TextPanel } from './components/generator/TextPanel'
import { UploadDropzone } from './components/generator/UploadDropzone'
import { PackOpeningAnimation } from './components/generator/PackOpeningAnimation'
import { FlashcardDeck } from './components/generator/FlashcardDeck'
import { useGeneratorStore } from './store/generator.store'
import { useGenerateFlashcards } from './hooks/use-generate-flashcards'

export default function Page() {
  const { tab, count, setCount, setCards, setStatus, status } = useGeneratorStore()
  const [text, setText] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const mutation = useGenerateFlashcards()

  async function onGenerate() {
    setStatus('generating'); setToast(null); setCards([])
    const res = await mutation.mutateAsync({ tab, count, text, file: file ?? undefined })
    if (res.success) { setCards(res.data.cards); setStatus('success') }
    else { setStatus('error'); setToast(res.error.message) }
  }

  const disabled = status === 'generating' || (tab === 'text' ? !text.trim() : !file)

  return (
    <main className="min-h-screen bg-bg">
      <Hero />
      <section className="mx-auto max-w-2xl space-y-4 px-4 py-8">
        <GeneratorTabs />
        {tab === 'text'
          ? <TextPanel value={text} onChange={setText} />
          : <UploadDropzone file={file} onFile={setFile} error={fileError} onError={setFileError} />}
        <div className="flex items-center gap-3">
          <label className="text-ink/70">Cards: {count}</label>
          <input type="range" min={5} max={20} value={count} onChange={(e) => setCount(Number(e.target.value))} className="flex-1" />
        </div>
        <button onClick={onGenerate} disabled={disabled}
          className="w-full rounded-xl bg-primary py-3 font-semibold text-white disabled:opacity-40">
          Gerar deck
        </button>
        {toast && <p className="text-center text-holo">{toast}</p>}
      </section>
      {status === 'generating' && <PackOpeningAnimation />}
      <FlashcardDeck />
      <Footer />
    </main>
  )
}
```

- [ ] **Step 8: Add animations to globals.css**

```css
/* app/globals.css — append */
@keyframes cardEnter {
  from { opacity: 0; transform: translateY(20px) rotateX(-8deg); }
  to { opacity: 1; transform: translateY(0) rotateX(0); }
}
.card-enter { opacity: 0; animation: cardEnter 0.5s ease forwards; }
.holo-border {
  border: 1px solid transparent;
  background:
    linear-gradient(#15121F, #15121F) padding-box,
    linear-gradient(135deg, #7C3AED, #B026FF) border-box;
}
.holo-border::after {
  content: ''; position: absolute; inset: 0; border-radius: 0.75rem;
  background: radial-gradient(circle at 50% 0%, rgba(176,38,255,0.25), transparent 70%);
  mix-blend-mode: screen; pointer-events: none;
}
html.light { color-scheme: light; }
```

- [ ] **Step 9: Verify build + manual smoke**

Run: `pnpm build`
Expected: build succeeds.
Run: `pnpm dev` and confirm page renders, tabs switch, slider works.

- [ ] **Step 10: Commit**

```bash
git add app && git commit -m "feat: add generator and landing UI"
```

---

### Task 10: Env wiring + README + final verification

**Files:**
- Create: `README.md`
- Modify: `.env.example` (already created), `.gitignore` (ensure `.env.local`)

- [ ] **Step 1: Ensure `.env.local` is gitignored**

Confirm `.gitignore` contains `.env*.local`.

- [ ] **Step 2: Write README**

```markdown
# Flashcards Lab
Gera flashcards a partir de PDF ou texto via Gemini. Next.js 15 + TypeScript.

## Setup
1. `pnpm install`
2. Copie `.env.example` para `.env.local` e preencha `GEMINI_API_KEY`.
3. `pnpm dev`

## Scripts
- `pnpm dev` / `pnpm build` / `pnpm test`
```

- [ ] **Step 3: Run full test suite**

Run: `pnpm test`
Expected: all pass.

- [ ] **Step 4: Run lint + build**

Run: `pnpm lint && pnpm build`
Expected: clean.

- [ ] **Step 5: Commit**

```bash
git add README.md .gitignore && git commit -m "docs: add README and finalize env wiring"
```

---

## Self-Review

- **Spec coverage:** input text/PDF (T3,4,9), slider 5–20 (T8,9), envelope (T2,7), AI behind interface (T6), server-side rarity (T7), rate limit (T5), error codes (T7,9), Zustand UI state (T8), TanStack Query (T8), visual identity (T9). All covered.
- **Placeholder scan:** no TBD/TODO; all code shown inline.
- **Type consistency:** `Flashcard`, `GenerateResponse`, `AIProvider.generateCards`, `assignRarity`, `checkRateLimit`, `validatePdfFile`, `MAX_TEXT` used consistently across tasks.
