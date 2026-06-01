/**
 * lib/types/api.ts
 *
 * Contratos TypeScript espelhando 1:1 os schemas OAS 3.1 da
 * Aura Lex AI Engine 1.0.0.
 *
 * Regra: nenhum `any` é tolerado aqui. Toda mudança de schema no backend
 * deve ser refletida aqui primeiro — o TypeScript apontará onde o código
 * precisa ser atualizado.
 */

// ──────────────────────────────────────────────────────────────────────────────
// Entidades base (espelham DecisionNode, Relationship e ReferenceItem do backend)
// ──────────────────────────────────────────────────────────────────────────────

export interface ApiReferenceItem {
  id: string
  type: "jurisprudence" | "law" | "doctrine"
  title: string
  url?: string
}

export interface ApiNode {
  id: string
  type: "decision" | "result"
  title: string
  description: string
  references: ApiReferenceItem[]
}

export interface ApiEdge {
  id: string
  source: string
  target: string
  label: "SIM" | "NÃO"
}

// ──────────────────────────────────────────────────────────────────────────────
// GET /cases  →  list[CaseItem]  (grafo completo de cada caso)
// GET /cases/{case_id}  →  CaseItem  (grafo completo de um caso)
// ──────────────────────────────────────────────────────────────────────────────

export interface CaseGraphResponse {
  id: string
  title: string
  nodes: ApiNode[]
  edges: ApiEdge[]
}

// ──────────────────────────────────────────────────────────────────────────────
// POST /cases  →  cria novo caso
// ──────────────────────────────────────────────────────────────────────────────

export interface CreateCaseBody {
  title: string
}

/** O backend retorna o CaseItem completo após criação */
export type CreateCaseResponse = CaseGraphResponse

// ──────────────────────────────────────────────────────────────────────────────
// DELETE /cases/{case_id}  →  204 No Content (sem body)
// ──────────────────────────────────────────────────────────────────────────────
// (sem tipos necessários — void é suficiente)

// ──────────────────────────────────────────────────────────────────────────────
// POST /cases/{case_id}/analyze  →  AnalyzeRequest / AnalyzeResponse
// ──────────────────────────────────────────────────────────────────────────────

export interface AnalyzeBody {
  /** Prompt jurídico enviado pelo usuário */
  prompt: string
  /**
   * ID do nó pai no grafo ao qual o novo nó será conectado.
   * ⚠️ OBRIGATÓRIO — validado no backend: retorna 404 se o ID
   *    não existir em case.nodes. Usar case.nodes[0].id como fallback
   *    quando nenhum nó estiver focado.
   */
  parent_node_id: string
}

export interface AnalyzeResponse {
  /** Novo nó gerado pela IA e persistido no Neo4j */
  node: ApiNode
  /** Aresta que conecta o nó pai ao novo nó */
  edge: ApiEdge
}

// ──────────────────────────────────────────────────────────────────────────────
// Envelope de Erro Normalizado (usado pelo interceptor do Axios)
// ──────────────────────────────────────────────────────────────────────────────

export interface ApiErrorResponse {
  /** Campo padrão do FastAPI para erros de validação e HTTPException */
  detail?: string
  /** Campo alternativo para erros customizados */
  message?: string
}

// ──────────────────────────────────────────────────────────────────────────────
// Sistema de Toast (UI state — não é schema da API, mas centralizado aqui)
// ──────────────────────────────────────────────────────────────────────────────

export type ToastType = "success" | "error" | "loading" | "info"

export interface Toast {
  id: string
  type: ToastType
  message: string
  /** Duração em ms antes do auto-dismiss. Default: 4000. Loading: sem dismiss. */
  duration?: number
}
