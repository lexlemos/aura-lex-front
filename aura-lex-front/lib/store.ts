/**
 * lib/store.ts
 *
 * Store global Zustand — integrada à Aura Lex AI Engine 1.0.0.
 *
 * Arquitetura:
 * - Ações assíncronas chamam a camada de serviço (lib/api/cases.ts)
 * - Erros são absorvidos aqui e comunicados via sistema de Toast
 * - Componentes React nunca recebem throws ou stack traces
 * - Nenhum console.log/error/dir com dados sensíveis do caso jurídico
 */

import { create } from "zustand"
import {
  fetchAllCases,
  createCase as apiCreateCase,
  deleteCaseById as apiDeleteCase,
  analyzeCase as apiAnalyzeCase,
} from "@/lib/api/cases"
import type { Toast } from "@/lib/types/api"

// ──────────────────────────────────────────────────────────────────────────────
// Tipos da UI (compatíveis com os tipos da API)
// ──────────────────────────────────────────────────────────────────────────────

export interface ReferenceItem {
  id: string
  type: "jurisprudence" | "law" | "doctrine"
  title: string
  url?: string
}

export interface DecisionNode {
  id: string
  type: "decision" | "result"
  title: string
  description: string
  references: ReferenceItem[]
}

export interface Relationship {
  id: string
  source: string
  target: string
  label: "SIM" | "NÃO"
}

export interface CaseItem {
  id: string
  title: string
  nodes: DecisionNode[]
  edges: Relationship[]
}

// ──────────────────────────────────────────────────────────────────────────────
// Interface da Store
// ──────────────────────────────────────────────────────────────────────────────

interface GraphState {
  // ── Estado do grafo ──────────────────────────────────────────────────────
  cases: CaseItem[]
  activeCaseId: string
  focusedNodeId: string | null
  readingNodeData: DecisionNode | null

  // ── Estado de carregamento (granular por operação) ────────────────────────
  isLoadingCases: boolean
  isAnalyzing: boolean

  // ── Sistema de Toast (feedback visual sem stack trace) ───────────────────
  toasts: Toast[]

  // ── Ações de navegação e UI ──────────────────────────────────────────────
  setActiveCaseId: (id: string) => void
  setFocusedNodeId: (id: string | null) => void
  setReadingNodeData: (data: DecisionNode | null) => void
  pushToast: (toast: Omit<Toast, "id">) => void
  dismissToast: (id: string) => void
  updateRootNodeDescription: (caseId: string, description: string) => void

  // ── Ações assíncronas (integradas à API real) ────────────────────────────
  loadCases: () => Promise<void>
  addNewCase: (title: string) => Promise<void>
  deleteCase: (id: string) => Promise<void>
  analyzeAndAddNode: (
    caseId: string,
    prompt: string,
    parentNodeId: string
  ) => Promise<void>
}

// ──────────────────────────────────────────────────────────────────────────────
// Store
// ──────────────────────────────────────────────────────────────────────────────

export const useGraphStore = create<GraphState>((set, get) => ({
  // Estado inicial — vazio até a API responder (mock removido)
  cases: [],
  activeCaseId: "",
  focusedNodeId: null,
  readingNodeData: null,
  isLoadingCases: false,
  isAnalyzing: false,
  toasts: [],

  // ── Ações de navegação e UI ────────────────────────────────────────────────

  setActiveCaseId: (id) =>
    set({ activeCaseId: id, focusedNodeId: null, readingNodeData: null }),

  setFocusedNodeId: (id) => set({ focusedNodeId: id }),

  setReadingNodeData: (data) => set({ readingNodeData: data }),

  pushToast: (toast) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        { ...toast, id: `toast-${Date.now()}-${Math.random()}` },
      ],
    })),

  dismissToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  updateRootNodeDescription: (caseId, description) => {
    set((state) => {
      let updatedReadingNodeData = state.readingNodeData
      const updatedCases = state.cases.map((c) => {
        if (c.id !== caseId) return c
        if (c.nodes.length === 0) return c

        // Root node is the node that has no incoming edges. Fallback to nodes[0].
        const rootNode = c.nodes.find((n) => !c.edges.some((e) => e.target === n.id)) || c.nodes[0]
        if (!rootNode) return c

        if (updatedReadingNodeData && updatedReadingNodeData.id === rootNode.id) {
          updatedReadingNodeData = { ...updatedReadingNodeData, description }
        }

        return {
          ...c,
          nodes: c.nodes.map((n) =>
            n.id === rootNode.id ? { ...n, description } : n
          ),
        }
      })

      return {
        cases: updatedCases,
        readingNodeData: updatedReadingNodeData,
      }
    })
  },

  // ── Ações assíncronas ──────────────────────────────────────────────────────

  /**
   * Carrega todos os casos com seus grafos completos (GET /cases).
   * Uma única chamada hidrata toda a store — chamada no mount da página.
   */
  loadCases: async () => {
    set({ isLoadingCases: true })
    try {
      const data = await fetchAllCases()
      const cases: CaseItem[] = data.map((c) => ({
        id: c.id,
        title: c.title,
        nodes: c.nodes,
        edges: c.edges,
      }))

      const firstId = cases.length > 0 ? cases[0].id : ""
      set({
        cases,
        activeCaseId: get().activeCaseId || firstId,
        isLoadingCases: false,
      })
    } catch (err) {
      set({ isLoadingCases: false })
      get().pushToast({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "Erro ao carregar os casos. Verifique a conexão com a API.",
      })
    }
  },

  /**
   * Cria um novo caso (POST /cases) e o adiciona à store após confirmação.
   * Assíncrono — a sidebar permanece bloqueada até a API confirmar.
   */
  addNewCase: async (title) => {
    set({ isLoadingCases: true })
    try {
      const created = await apiCreateCase({ title })
      const newCase: CaseItem = {
        id: created.id,
        title: created.title,
        nodes: created.nodes ?? [],
        edges: created.edges ?? [],
      }
      set((state) => ({
        cases: [newCase, ...state.cases],
        activeCaseId: newCase.id,
        focusedNodeId: null,
        readingNodeData: null,
        isLoadingCases: false,
      }))
      get().pushToast({
        type: "success",
        message: `Caso "${title}" criado com sucesso.`,
        duration: 3000,
      })
    } catch (err) {
      set({ isLoadingCases: false })
      get().pushToast({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "Erro ao criar o caso. Tente novamente.",
      })
    }
  },

  /**
   * Remove um caso (DELETE /cases/{id}) e o retira da store após 204.
   * Se o caso ativo for deletado, ativa o próximo disponível.
   */
  deleteCase: async (id) => {
    set({ isLoadingCases: true })
    try {
      await apiDeleteCase(id)
      set((state) => {
        const updatedCases = state.cases.filter((c) => c.id !== id)
        let nextActiveId = state.activeCaseId

        if (state.activeCaseId === id) {
          nextActiveId = updatedCases.length > 0 ? updatedCases[0].id : ""
        }

        return {
          cases: updatedCases,
          activeCaseId: nextActiveId,
          focusedNodeId: null,
          readingNodeData: null,
          isLoadingCases: false,
        }
      })
    } catch (err) {
      set({ isLoadingCases: false })
      get().pushToast({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "Erro ao excluir o caso. Tente novamente.",
      })
    }
  },

  /**
   * Envia o prompt jurídico para a IA (POST /cases/{id}/analyze) e injeta
   * o {node, edge} retornado diretamente no grafo do caso ativo.
   *
   * Fluxo reativo:
   *   1. isAnalyzing = true  →  UI bloqueia input + exibe spinner
   *   2. IA processa (10–40s)
   *   3a. Sucesso: node+edge injetados no caso; foco movido para o novo nó
   *   3b. Falha: Toast de erro amigável; nenhum stack trace exposto
   *   4. isAnalyzing = false  →  UI desbloqueada
   */
  analyzeAndAddNode: async (caseId, prompt, parentNodeId) => {
    set({ isAnalyzing: true })
    try {
      const result = await apiAnalyzeCase(caseId, {
        prompt,
        parent_node_id: parentNodeId,
      })

      set((state) => ({
        cases: state.cases.map((c) => {
          if (c.id !== caseId) return c
          return {
            ...c,
            nodes: [...c.nodes, result.node],
            edges: [...c.edges, result.edge],
          }
        }),
        isAnalyzing: false,
        focusedNodeId: result.node.id,
      }))

      get().pushToast({
        type: "success",
        message: "Nó jurídico adicionado ao grafo.",
        duration: 3500,
      })
    } catch (err) {
      set({ isAnalyzing: false })
      get().pushToast({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "A análise da IA falhou. Tente novamente.",
        duration: 6000,
      })
    }
  },
}))
