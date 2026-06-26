import {
  textSchema,
  validatePdfFile,
} from "@/app/lib/validation/generate.schema";
import { extractText } from "@/app/lib/parsing/pdf";
import { checkRateLimit } from "@/app/lib/rate-limit";
import { geminiProvider } from "@/app/lib/ai/provider";
import { isAuthError } from "@/app/lib/ai/classify-error";
import { assignRarity } from "@/app/lib/rarity";
import { ok, fail } from "@/app/lib/http/envelope";

export async function POST(req: Request) {
  // Falha cedo e com mensagem clara se o servidor não tiver a chave do Gemini
  // (causa comum em deploy: variável de ambiente não configurada na Vercel).
  if (!process.env.GEMINI_API_KEY?.trim()) {
    return Response.json(
      fail(
        "CONFIG_ERROR",
        "A IA não está configurada no servidor (falta a GEMINI_API_KEY).",
      ),
      { status: 503 },
    );
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  if (!checkRateLimit(ip)) {
    return Response.json(
      fail("RATE_LIMITED", "Muitas gerações, tente mais tarde."),
      { status: 429 },
    );
  }

  const contentType = req.headers.get("content-type") ?? "";
  let content: string;
  let count: number;

  try {
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file");
      count = Number(form.get("count"));
      if (!(file instanceof File)) {
        return Response.json(fail("INVALID_INPUT", "Arquivo ausente."), {
          status: 400,
        });
      }
      const fileError = validatePdfFile(file);
      if (fileError) {
        return Response.json(fail(fileError, "PDF inválido."), { status: 400 });
      }
      if (count < 5 || count > 20) {
        return Response.json(fail("INVALID_INPUT", "Quantidade inválida."), {
          status: 400,
        });
      }
      content = await extractText(await file.arrayBuffer());
    } else {
      const body = await req.json();
      const parsed = textSchema.safeParse(body);
      if (!parsed.success) {
        return Response.json(fail("INVALID_INPUT", "Entrada inválida."), {
          status: 400,
        });
      }
      content = parsed.data.text;
      count = parsed.data.count;
    }
  } catch (e) {
    const code =
      e instanceof Error && e.message === "PDF_NO_TEXT"
        ? "PDF_NO_TEXT"
        : "INVALID_INPUT";
    const msg =
      code === "PDF_NO_TEXT"
        ? "PDF sem texto extraível."
        : "Entrada inválida.";
    return Response.json(fail(code, msg), { status: 400 });
  }

  try {
    const pairs = await geminiProvider.generateCards(content, count);
    return Response.json(ok({ cards: assignRarity(pairs) }));
  } catch (e) {
    if (isAuthError(e)) {
      return Response.json(
        fail(
          "INVALID_API_KEY",
          "Chave de IA inválida ou sem permissão. Verifique a GEMINI_API_KEY.",
        ),
        { status: 502 },
      );
    }
    return Response.json(fail("AI_ERROR", "Erro ao gerar, tente de novo."), {
      status: 502,
    });
  }
}
