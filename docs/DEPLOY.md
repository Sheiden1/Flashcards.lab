# Deploy (Vercel)

O Flashcards Lab é um app Next.js único, sem backend separado. Deploy direto na Vercel.

## Passos

1. **Importe o repositório** em [vercel.com](https://vercel.com) → **Add New → Project** → `Sheiden1/Flashcards.lab`.
   A Vercel detecta Next.js e pnpm automaticamente — não precisa configurar build.

2. **Configure a variável de ambiente** (passo obrigatório):

   | Key | Value | Environments |
   |---|---|---|
   | `GEMINI_API_KEY` | sua chave do [Google AI Studio](https://aistudio.google.com) | Production, Preview, Development |

   > Opcional: `NEXT_PUBLIC_SITE_URL` com o domínio final (ex.: `https://flashcardslab.vercel.app`)
   > para que OG image, `robots.txt` e `sitemap.xml` apontem para a URL correta.

3. **Deploy.** Em deploys seguintes, lembre que **variáveis novas só valem após um Redeploy**
   (Deployments → ⋯ → Redeploy) — o deploy atual não enxerga variáveis adicionadas depois.

## Diagnóstico de erros de geração

A geração depende da `GEMINI_API_KEY` no ambiente do servidor. Se algo falhar, o card de erro
indica a causa:

| Mensagem | Código | Causa / correção |
|---|---|---|
| "A IA não está configurada no servidor…" | `CONFIG_ERROR` (503) | `GEMINI_API_KEY` ausente no deploy → adicione e faça Redeploy |
| "Chave de IA inválida ou sem permissão…" | `INVALID_API_KEY` (502) | Chave errada/revogada → gere outra no AI Studio e atualize |
| "Muitas gerações, tente mais tarde." | `RATE_LIMITED` (429) | Limite de 10 gerações/hora por IP (em memória) |
| "PDF sem texto extraível." | `PDF_NO_TEXT` (400) | PDF é imagem/escaneado, sem texto selecionável |
| "Erro ao gerar, tente de novo." | `AI_ERROR` (502) | Falha genérica da IA (timeout, indisponibilidade) |

## Notas

- A chave **nunca** é versionada: fica em `.env.local` (gitignored) localmente e nas env vars da Vercel em produção.
- O rate limit é em memória por instância serverless — suficiente para uso pessoal; para escala maior, trocar por um store compartilhado (Redis).
