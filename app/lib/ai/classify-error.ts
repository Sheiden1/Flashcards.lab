/**
 * Detecta se um erro vindo do motor de IA é de autenticação/chave inválida
 * (HTTP 401/403, ou mensagens típicas da Gemini). Permite ao route handler
 * devolver uma mensagem clara em vez do genérico "erro ao gerar" — causa
 * comum em deploy com GEMINI_API_KEY errada.
 */
export function isAuthError(e: unknown): boolean {
  const status = (e as { status?: number })?.status;
  if (status === 401 || status === 403) return true;

  const msg = (e instanceof Error ? e.message : String(e ?? "")).toLowerCase();
  return (
    msg.includes("api key") ||
    msg.includes("api_key") ||
    msg.includes("api key not valid") ||
    msg.includes("permission") ||
    msg.includes("unauthenticated") ||
    msg.includes("unauthorized")
  );
}
