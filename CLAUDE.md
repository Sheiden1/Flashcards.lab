# Flashcards Lab — Contexto do Projeto

Contexto autocontido com stack, estrutura de pastas, identidade visual e padrões do Flashcards Lab. Dar a um assistente de IA ao iniciar qualquer sessão de desenvolvimento.

**O que é:** landing page única que gera flashcards a partir de PDF (até 2MB) ou texto colado. Projeto pessoal de portfólio — sem login, sem monetização, uso por mim e amigos. Reformulação do projeto antigo (flashcardslab.vercel.app), com mais cuidado de engenharia e identidade visual.

---

## 1. Stack

- **Next.js 15** (App Router), React, TypeScript strict
- Tailwind CSS, shadcn/ui (Radix por baixo)
- TanStack Query (estado de servidor) + Zustand (estado de UI, só local)
- Zod para validação de input
- **Gemini API** (Google AI Studio) como motor de geração — free tier, modelos Flash/Flash-Lite
- `unpdf` para extração de texto de PDF (sem dependência nativa pesada)
- Deploy: Vercel, app único (sem backend separado)

Sem Prisma/Postgres, sem Clerk/auth, sem monorepo. É um fluxo único e stateless — gera o deck e mostra na tela, nada persiste entre sessões.

---

## 2. Princípios

- **Route Handler fino.** `app/api/generate/route.ts` só valida com Zod e delega — igual um controller fino: sem regra de negócio ali.
- **Lógica isolada em `lib/`.** Geração de flashcard, parsing de PDF e prompts vivem em módulos próprios, não no route handler.
- **Envelope de resposta único:** `{ success: true, data }` ou `{ success: false, error: { code, message } }`.
- **Motor de IA atrás de interface.** `lib/ai/provider.ts` abstrai o Gemini — troca de motor não deve tocar em mais nada do código.
- **Server state vs UI state separados.** TanStack Query cuida de loading/erro/cache da geração. Zustand cuida só de estado de interface (aba ativa, estado do upload, flip do card).
- **Sem conta, sem banco.** Ponto de extensão claro se um dia quiser salvar deck/histórico — não é a base agora.

---

## 3. Estrutura de pastas

```
flashcards-lab/
├── .env.local                      # GEMINI_API_KEY (não versionar)
├── .env.example
├── .gitignore
├── next.config.ts
├── tailwind.config.ts              # tokens de cor + fontes
├── postcss.config.js
├── tsconfig.json
├── package.json
├── README.md
│
├── public/
│   └── favicon, og-image
│
├── app/
│   ├── layout.tsx                  # <html>, ThemeProvider, fontes via next/font
│   ├── page.tsx                    # landing + gerador, página única
│   ├── globals.css                 # tokens CSS dark/light
│   │
│   ├── api/
│   │   └── generate/
│   │       └── route.ts            # POST: valida → lib/ai → devolve envelope
│   │
│   ├── components/
│   │   ├── ui/                     # primitivos shadcn (button, input, tabs, dialog)
│   │   ├── landing/
│   │   │   ├── Hero.tsx
│   │   │   ├── ThemeToggle.tsx
│   │   │   └── Footer.tsx
│   │   └── generator/
│   │       ├── GeneratorTabs.tsx        # alterna Texto / PDF
│   │       ├── TextPanel.tsx
│   │       ├── UploadDropzone.tsx       # valida 2MB no client
│   │       ├── PackOpeningAnimation.tsx # abertura do "pacote" ao gerar o deck
│   │       ├── FlashcardDeck.tsx        # grid dos cards gerados
│   │       └── FlashcardCard.tsx        # card individual: flip 3D + glow holográfico
│   │
│   ├── hooks/
│   │   └── use-generate-flashcards.ts   # TanStack Query mutation
│   │
│   ├── store/
│   │   └── generator.store.ts           # Zustand: aba ativa, estado de upload, flip
│   │
│   └── lib/
│       ├── ai/
│       │   ├── provider.ts              # abstração do motor (Gemini hoje)
│       │   └── prompts.ts               # prompt de extração/geração
│       ├── parsing/
│       │   └── pdf.ts                   # extrai texto do PDF
│       ├── validation/
│       │   └── generate.schema.ts       # Zod: tipo, 2MB, texto min/max
│       ├── rate-limit.ts                # limite simples por IP em memória
│       └── http/
│           └── envelope.ts              # { success, data } | { success, error }
│
└── types/
    └── index.ts                         # Flashcard, GenerateRequest, GenerateResponse
```

---

## 4. Convenções de nomenclatura

- PascalCase para componentes (`FlashcardCard.tsx`, `UploadDropzone.tsx`)
- kebab-case para diretórios, hooks, stores, libs (`use-generate-flashcards.ts`, `generator.store.ts`)
- Classes/tipos em PascalCase, funções/variáveis em camelCase

---

## 5. Identidade visual — direção TCG holográfico

Conceito: cada flashcard é uma "carta". Nível de domínio do conteúdo mapeia pra raridade visual (comum → raro → holográfico), inspirado no sistema de Card Styles do MTG Arena.

### Paleta

| Token | Dark | Light |
|---|---|---|
| Fundo | `#0A0A0F` | `#FFFFFF` |
| Superfície do card | `#15121F` | `#F4F0FA` |
| Roxo primário (ações, bordas) | `#7C3AED` | `#7C3AED` |
| Magenta-roxo (holográfico, uso raro) | `#B026FF` | `#B026FF` |
| Texto principal | `#F4F2F8` | `#1A1625` |

### Tipografia

- **Display:** Clash Display ou Cabinet Grotesk — logo, hero, título do deck
- **Corpo:** Inter ou General Sans — pergunta/resposta, UI geral

### Layout (landing única)

```
[FLASHCARDS LAB]                      ◐ tema
   Transforme qualquer conteúdo
        em cartas de estudo
   [ Colar texto ]   [ Enviar PDF ]
   ┌──────────────────────────┐
   │   ...área de input...    │
   └──────────────────────────┘
            [ Gerar deck ]
──────────── resultado ────────────
┌─────────┐  ┌─────────┐  ┌─────────┐
│ pergunta │  │ pergunta │  │✦pergunta│  ← holográfico
└─────────┘  └─────────┘  └─────────┘
   clique vira o card (flip 3D) → resposta
```

### Assinatura (signature element)

Ao terminar a geração, os cards "abrem" como um pacote: entram em tela com delay escalonado e leve rotação 3D. Brilho holográfico segue o cursor/toque (gradient + `mix-blend-mode`, CSS puro, sem lib pesada).

---

## 6. Motor de IA (Gemini)

- Chave gerada em aistudio.google.com, **sem billing ativado no projeto** — ativar billing remove o free tier por completo.
- Modelos livres hoje: Gemini 2.5 Flash / Flash-Lite / 3 Flash (modelos Pro não são free desde abril/2026).
- `lib/ai/provider.ts` isola a chamada — qualquer troca de motor futura passa só por esse arquivo.

---

## 7. Limites e segurança

- PDF: máximo 2MB, validado no client (`UploadDropzone`) e de novo no servidor (Zod).
- Rate limit simples por IP em `lib/rate-limit.ts` (em memória, sem Redis) — página é pública e sem login, então precisa de alguma proteção contra abuso do free tier do Gemini.

---

## 8. Variáveis de ambiente

```bash
# .env.local
GEMINI_API_KEY=...
```

---

## 9. Comandos

```bash
pnpm dev
pnpm build
pnpm lint
```

---

## 10. Pontos de extensão futuros (fora do MVP)

| Extensão | Onde plugar |
|---|---|
| Salvar deck / histórico | precisa de banco — ainda não decidido qual |
| Export pra Anki | módulo novo em `lib/export/` |
| Conta de usuário | precisaria reavaliar auth — fora do escopo atual |
