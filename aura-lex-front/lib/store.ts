import { create } from "zustand"
import { CaseItem, DecisionNode, Relationship } from "@/types/graph"

interface GraphState {
  cases: CaseItem[]
  activeCaseId: string
  focusedNodeId: string | null
  readingNodeData: DecisionNode | null
  isGenerating: boolean
  error: string | null
  isLeftSidebarOpen: boolean
  isRightSidebarOpen: boolean

  // Ações básicas
  setActiveCaseId: (id: string) => void
  setFocusedNodeId: (id: string | null) => void
  setReadingNodeData: (data: DecisionNode | null) => void
  setGenerating: (generating: boolean) => void
  setError: (error: string | null) => void
  toggleLeftSidebar: () => void
  toggleRightSidebar: () => void

  // Mutações locais
  addNewCase: (title: string, nodes?: DecisionNode[], edges?: Relationship[]) => string
  deleteCase: (id: string) => void
  addCustomNode: (caseId: string, node: DecisionNode, edge: Relationship) => void

  // Comunicação com FastAPI
  fetchLegalQuery: (query: string, files: File[]) => Promise<void>
}

const defaultCases: CaseItem[] = [
  {
    id: "case-1",
    title: "Recurso Ordinário Trabalhista",
    nodes: [
      {
        id: "node-root",
        type: "decision",
        title: "Admissibilidade Recursal",
        description: "O recurso ordinário foi protocolado dentro do prazo de 8 dias úteis?",
        references: [
          {
            id: "ref-1",
            type: "law",
            title: "Art. 895, CLT",
            url: "https://www.jusbrasil.com.br/topicos/10714774/artigo-895-da-consolidacao-das-leis-do-trabalho-decreto-lei-n-5452-de-01-de-maio-de-1943",
          },
          {
            id: "ref-2",
            type: "doctrine",
            title: "Teoria da Recorribilidade Trabalhista",
          },
        ],
      },
      {
        id: "node-preparo",
        type: "decision",
        title: "Preparo Efetuado",
        description: "As custas processuais e o depósito recursal foram devidamente pagos e comprovados?",
        references: [
          {
            id: "ref-3",
            type: "jurisprudence",
            title: "Súmula 245, TST",
            url: "https://www.jusbrasil.com.br/jurisprudencia/sumulas/tst/sumula-245",
          },
        ],
      },
      {
        id: "node-intempestivo",
        type: "result",
        title: "Recurso Intempestivo",
        description: "Extinção do processo sem resolução do mérito por intempestividade.",
        references: [
          {
            id: "ref-4",
            type: "law",
            title: "Art. 932, III, CPC",
            url: "https://www.jusbrasil.com.br/topicos/28892497/artigo-932-da-lei-n-13105-de-16-de-marco-de-2015",
          },
        ],
      },
      {
        id: "node-vinculo",
        type: "decision",
        title: "Vínculo Empregatício",
        description: "Ficou caracterizada a subordinação, habitualidade, onerosidade e pessoalidade?",
        references: [
          {
            id: "ref-5",
            type: "law",
            title: "Art. 3º, CLT",
            url: "https://www.jusbrasil.com.br/topicos/10729780/artigo-3-da-consolidacao-das-leis-do-trabalho-decreto-lei-n-5452-de-01-de-maio-de-1943",
          },
          {
            id: "ref-6",
            type: "doctrine",
            title: "Curso de Trabalho - M. Godinho",
          },
        ],
      },
      {
        id: "node-deserto",
        type: "result",
        title: "Recurso Deserto",
        description: "Não conhecimento do recurso ordinário por deserção do preparo.",
        references: [
          {
            id: "ref-7",
            type: "jurisprudence",
            title: "Súmula 128, TST",
            url: "https://www.jusbrasil.com.br/jurisprudencia/sumulas/tst/sumula-128",
          },
        ],
      },
      {
        id: "node-procedente",
        type: "result",
        title: "Sentença Mantida",
        description: "Manutenção do reconhecimento do vínculo empregatício em segunda instância.",
        references: [
          {
            id: "ref-8",
            type: "jurisprudence",
            title: "Acórdão Regional, TRT",
          },
        ],
      },
      {
        id: "node-improcedente",
        type: "result",
        title: "Sentença Reformada",
        description: "Afastamento do vínculo por ausência de prova de subordinação.",
        references: [
          {
            id: "ref-9",
            type: "jurisprudence",
            title: "Precedente Subordinação, TRT",
          },
        ],
      },
    ],
    edges: [
      { id: "e1", source: "node-root", target: "node-preparo", label: "SIM" },
      { id: "e2", source: "node-root", target: "node-intempestivo", label: "NÃO" },
      { id: "e3", source: "node-preparo", target: "node-vinculo", label: "SIM" },
      { id: "e4", source: "node-preparo", target: "node-deserto", label: "NÃO" },
      { id: "e5", source: "node-vinculo", target: "node-procedente", label: "SIM" },
      { id: "e6", source: "node-vinculo", target: "node-improcedente", label: "NÃO" },
    ],
  },
]

export const useGraphStore = create<GraphState>((set, get) => ({
  cases: defaultCases,
  activeCaseId: "case-1",
  focusedNodeId: null,
  readingNodeData: null,
  isGenerating: false,
  error: null,
  isLeftSidebarOpen: true,
  isRightSidebarOpen: true,

  setActiveCaseId: (id) => set({ activeCaseId: id, focusedNodeId: null, readingNodeData: null, error: null }),
  setFocusedNodeId: (id) => set({ focusedNodeId: id }),
  setReadingNodeData: (data) => set({ readingNodeData: data }),
  setGenerating: (generating) => set({ isGenerating: generating }),
  setError: (error) => set({ error }),
  toggleLeftSidebar: () => set((state) => ({ isLeftSidebarOpen: !state.isLeftSidebarOpen })),
  toggleRightSidebar: () => set((state) => ({ isRightSidebarOpen: !state.isRightSidebarOpen })),

  addNewCase: (title, nodes, edges) => {
    const newId = `case-${Date.now()}`
    const newCase: CaseItem = {
      id: newId,
      title,
      nodes: nodes || [
        {
          id: `node-root-${Date.now()}`,
          type: "decision",
          title: "Nó Inicial",
          description: "Escreva no chat para criar novas hipóteses de decisão.",
          references: [],
        },
      ],
      edges: edges || [],
    }
    set((state) => ({
      cases: [newCase, ...state.cases],
      activeCaseId: newId,
      focusedNodeId: null,
      readingNodeData: null,
    }))
    return newId
  },

  deleteCase: (id) =>
    set((state) => {
      const updatedCases = state.cases.filter((c) => c.id !== id)
      let nextActiveId = state.activeCaseId

      if (state.activeCaseId === id) {
        nextActiveId = updatedCases.length > 0 ? updatedCases[0].id : ""
      }

      if (updatedCases.length === 0) {
        const defaultId = "case-default"
        const defaultCase: CaseItem = {
          id: defaultId,
          title: "Novo Caso Padrão",
          nodes: [
            {
              id: "node-default-root",
              type: "decision",
              title: "Nó Inicial",
              description: "Digite uma mensagem no chat para começar.",
              references: [],
            },
          ],
          edges: [],
        }
        return {
          cases: [defaultCase],
          activeCaseId: defaultId,
          focusedNodeId: null,
          readingNodeData: null,
        }
      }

      return {
        cases: updatedCases,
        activeCaseId: nextActiveId,
        focusedNodeId: null,
        readingNodeData: null,
      }
    }),

  addCustomNode: (caseId, node, edge) =>
    set((state) => ({
      cases: state.cases.map((c) => {
        if (c.id === caseId) {
          return {
            ...c,
            nodes: [...c.nodes, node],
            edges: [...c.edges, edge],
          }
        }
        return c
      }),
    })),

  fetchLegalQuery: async (query, files) => {
    const store = get()
    set({ isGenerating: true, error: null })

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const formData = new FormData()
      formData.append("query", query)
      files.forEach((file) => {
        formData.append("files", file)
      })

      const response = await fetch(`${apiBaseUrl}/api/v1/legal-query`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Falha na requisição: ${response.statusText}`)
      }

      const data: CaseItem = await response.json()
      
      // Salva e ativa o caso gerado
      store.addNewCase(data.title, data.nodes, data.edges)
    } catch (err: unknown) {
      console.error(err)
      const errorMessage = err instanceof Error ? err.message : "Erro de rede ao conectar com a IA."
      set({ error: errorMessage })
    } finally {
      set({ isGenerating: false })
    }
  },
}))
