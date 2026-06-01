/**
 * lib/api/client.ts
 *
 * Instância central do Axios para a Aura Lex AI Engine 1.0.0.
 *
 * Regras de segurança (ZERO-LEAK):
 * - A Base URL vive EXCLUSIVAMENTE em process.env.NEXT_PUBLIC_API_BASE_URL
 * - Nenhum payload de request, resposta da LLM ou dado sensível do caso
 *   jurídico é exposto via console.log / console.error / console.dir
 * - O interceptor de response normaliza erros para strings amigáveis antes
 *   de repassá-los à store — componentes React nunca veem stack traces ou
 *   payloads brutos da API
 */

import axios from "axios"

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  /**
   * 60 segundos — necessário para a rota POST /analyze.
   * O pipeline HuggingFace Inference pode levar 10–40s em hardware
   * compartilhado; 30s seria insuficiente em cenários de carga.
   */
  timeout: 60_000,
  headers: { "Content-Type": "application/json" },
})

// ──────────────────────────────────────────────────────────────────────────────
// Request Interceptor
// Sem autenticação implementada no backend (security.py vazio).
// O interceptor existe para extensibilidade futura (ex: Bearer token).
// ──────────────────────────────────────────────────────────────────────────────
apiClient.interceptors.request.use((config) => config)

// ──────────────────────────────────────────────────────────────────────────────
// Response Interceptor — Normalização de erros (ZERO-LEAK)
// ──────────────────────────────────────────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    // 🔒 ZERO-LEAK: Extraímos apenas a mensagem de erro pública do backend.
    // O payload completo, a resposta da LLM e qualquer dado do caso jurídico
    // NÃO são propagados para cima da call stack.
    let userMessage = "Ocorreu um erro inesperado. Tente novamente."
    let status = 0

    if (axios.isAxiosError(error)) {
      status = error.response?.status ?? 0

      // FastAPI retorna erros em `detail` (HTTPException) ou `message`
      const rawDetail = error.response?.data?.detail
      const rawMessage = error.response?.data?.message

      if (typeof rawDetail === "string" && rawDetail.trim()) {
        userMessage = rawDetail
      } else if (typeof rawMessage === "string" && rawMessage.trim()) {
        userMessage = rawMessage
      } else if (error.code === "ECONNABORTED") {
        userMessage =
          "A análise da IA demorou mais que o esperado. Tente novamente."
      } else if (!error.response) {
        userMessage =
          "Não foi possível conectar ao servidor. Verifique sua conexão."
      }
    }

    const normalizedError = new Error(userMessage) as Error & {
      status: number
    }
    normalizedError.status = status

    return Promise.reject(normalizedError)
  }
)

export default apiClient
