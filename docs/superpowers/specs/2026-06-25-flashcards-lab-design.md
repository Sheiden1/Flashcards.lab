# Flashcards Lab — Design Spec

**Data:** 2026-06-25
**Status:** Aprovado

## Visão geral

Landing page única (Next.js 15, App Router) que gera flashcards a partir de PDF (≤2MB) ou texto colado (≤10.000 chars), usando Gemini API (free tier). Fluxo único, stateless — gera o deck e mostra na tela, nada persiste entre sessões.

## Decisões de produto

| Tema | Decisão |
|---|---|
| Fluxo de estudo | Livre — usuário vira cards à vontade, sem progresso/rating |
| Quantidade de cards | Slider 5–20, padrão 10 |
| Raridade visual | 2 níveis: `normal` + exatamente 1 `holographic` por deck |
| Limite texto colado | 10.000 chars, com contador visível |
| Idioma | Auto-detectado pela IA (segue o conteúdo) |
| Persistência | Nenhuma — estado vive em Zustand, some ao fechar a aba |

## Arquitetura

Página única `app/page.tsx` com duas zonas: input (topo) e deck (aparece após geração).

```
app/page.tsx
  ├── <Hero />                  logo, headline, ThemeToggle
  ├── <GeneratorTabs />         alterna Texto / PDF
  │     ├── <TextPanel />       textarea + contador de chars
  │     └── <UploadDropzone />  drag-and-drop, valida 2MB no client
  ├── slider de quantidade      5–20 cards, padrão 10
  ├── botão "Gerar deck"        dispara mutation
  ├── <PackOpeningAnimation />  durante loading
  └── <FlashcardDeck />         grid de cards após geração
        └── <FlashcardCard />   flip 3D; 1 card = holográfico
```

### Fluxo de dados

1. Usuário preenche input + ajusta slider → clica "Gerar deck".
2. `use-generate-flashcards.ts` (TanStack Query mutation) faz POST `/api/generate`.
3. Route handler valida com Zod → chama `lib/ai/provider.ts` → retorna envelope.
4. Mutation recebe `{ success: true, data: { cards } }` → Zustand store guarda os cards.
5. `PackOpeningAnimation` roda → `FlashcardDeck` renderiza com delay escalonado por card.

Erros retornam `{ success: false, error: { code, message } }` → toast ou inline error.

## Contratos e tipos

```typescript
// types/index.ts
type Rarity = 'normal' | 'holographic'

interface Flashcard {
  id: string
  question: string
  answer: string
  rarity: Rarity
}

interface GenerateRequest {
  source: 'text' | 'pdf'
  text?: string   // quando source = 'text'
  count: number   // 5–20
  // PDF chega como multipart, não no JSON
}

type GenerateResponse =
  | { success: true; data: { cards: Flashcard[] } }
  | { success: false; error: { code: string; message: string } }
```

**Atribuição de raridade:** a IA gera só `question`/`answer`. O servidor sorteia 1 índice do array e marca como `holographic`. Mantém a regra fora do prompt — mais confiável.

## Camada de IA e validação

- **`lib/validation/generate.schema.ts`** — dois schemas Zod:
  - `textSchema`: `text` 1–10.000 chars, `count` int 5–20.
  - `pdfSchema`: arquivo ≤2MB, mime `application/pdf`, `count` 5–20.
- **`lib/ai/provider.ts`** — interface `AIProvider` com `generateCards(content: string, count: number): Promise<{ question: string; answer: string }[]>`. Implementação `GeminiProvider` hoje. O route handler só conhece a interface.
- **`lib/ai/prompts.ts`** — prompt que detecta idioma, gera exatamente `count` pares Q/A, responde em JSON estruturado (`responseMimeType: application/json` do Gemini para parsing confiável).
- **`lib/parsing/pdf.ts`** — `extractText(buffer): Promise<string>` via `unpdf`. PDF imagem-only (texto vazio) → erro `PDF_NO_TEXT`.
- **`lib/rate-limit.ts`** — Map em memória por IP, janela deslizante de 10 gerações/hora → `RATE_LIMITED`.
- **`lib/http/envelope.ts`** — helpers `ok(data)` / `fail(code, message)`.

## Erros e estados de UI

| Código | Origem | UI |
|---|---|---|
| `RATE_LIMITED` | rate-limit | toast "Muitas gerações, tente mais tarde" |
| `PDF_TOO_LARGE` | Zod/client | inline no dropzone |
| `PDF_NO_TEXT` | parsing | inline "PDF sem texto extraível" |
| `INVALID_INPUT` | Zod | inline no campo |
| `AI_ERROR` | Gemini falhou | toast "Erro ao gerar, tente de novo" |

Estados do gerador (Zustand): `idle → generating → success | error`. Durante `generating`, input desabilitado + `PackOpeningAnimation`.

## Identidade visual

Direção TCG holográfico (ver CLAUDE.md §5 para paleta/tipografia completas).

- Paleta: fundo `#0A0A0F`/`#FFFFFF`, superfície card `#15121F`/`#F4F0FA`, roxo `#7C3AED`, magenta holográfico `#B026FF`.
- Display: Clash Display / Cabinet Grotesk. Corpo: Inter / General Sans.
- Assinatura: cards "abrem" como pacote (delay escalonado + rotação 3D leve); brilho holográfico segue cursor via gradient + `mix-blend-mode`, CSS puro.

## Testes

- **`lib/` puro:** unit tests para `pdf.ts` (com/sem texto), `rate-limit.ts` (janela), schemas Zod (bordas).
- **`provider.ts`:** mock da resposta Gemini, valida parsing e contagem de cards.
- **Route handler:** integração com provider mockado — envelope de sucesso e cada código de erro.
- **Componentes:** `FlashcardCard` (flip) se houver tempo; não bloqueia MVP.

## Fora de escopo (extensões futuras)

Salvar deck/histórico (precisa de banco), export Anki (`lib/export/`), conta de usuário/auth.
