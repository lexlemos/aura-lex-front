/**
 * lib/api/cases.ts
 *
 * Camada de serviço isolada para o recurso /cases da Aura Lex AI Engine.
 *
 * Regras:
 * - Nenhum componente React faz fetch/axios diretamente — tudo passa por aqui
 * - Cada função é pura, tipada e testável isoladamente
 * - Erros são normalizados pelo interceptor do client.ts antes de chegar aqui
 */

import apiClient from "./client"
import type {
  CaseGraphResponse,
  CreateCaseBody,
  CreateCaseResponse,
  AnalyzeBody,
  AnalyzeResponse,
} from "@/lib/types/api"

/**
 * GET /cases
 * Retorna o grafo completo (nodes + edges) de TODOS os casos.
 * Uma única chamada hidrata toda a store — sem lazy loading necessário.
 */
export async function fetchAllCases(): Promise<CaseGraphResponse[]> {
  const { data } = await apiClient.get<CaseGraphResponse[]>("/cases")
  return data
}

/**
 * GET /cases/{case_id}
 * Retorna o grafo completo de UM caso específico.
 * Reservado para refresh pontual — não usado no fluxo principal de navegação.
 */
export async function fetchCaseById(
  caseId: string
): Promise<CaseGraphResponse> {
  const { data } = await apiClient.get<CaseGraphResponse>(`/cases/${caseId}`)
  return data
}

/**
 * POST /cases
 * Cria um novo caso. Recebe { title } e retorna o CaseItem completo.
 */
export async function createCase(
  body: CreateCaseBody
): Promise<CreateCaseResponse> {
  const { data } = await apiClient.post<CreateCaseResponse>("/cases", body)
  return data
}

/**
 * DELETE /cases/{case_id}
 * Remove um caso e seu grafo completo do Neo4j.
 * Retorna 204 No Content (void).
 */
export async function deleteCaseById(caseId: string): Promise<void> {
  await apiClient.delete(`/cases/${caseId}`)
}

/**
 * POST /cases/{case_id}/analyze
 * Envia um prompt jurídico para a IA (HuggingFace) e recebe o novo
 * { node, edge } para injeção reativa no grafo local.
 *
 * ⚠️  parent_node_id é OBRIGATÓRIO e validado no backend:
 *     se o ID não existir em case.nodes → HTTP 404.
 *     O caller deve resolver: focusedNodeId ?? case.nodes[0].id
 */
export async function analyzeCase(
  caseId: string,
  body: AnalyzeBody
): Promise<AnalyzeResponse> {
  const { data } = await apiClient.post<AnalyzeResponse>(
    `/cases/${caseId}/analyze`,
    body
  )
  return data
}
