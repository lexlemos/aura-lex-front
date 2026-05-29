import type { Node as RFNode, Edge as RFEdge } from "@xyflow/react"

export interface ReferenceItem {
  id: string
  type: "jurisprudence" | "law" | "doctrine"
  title: string
  url?: string
}

// Nó do Grafo recebido/enviado para o FastAPI
export interface DecisionNode {
  id: string
  type: "decision" | "result"
  title: string
  description: string
  references: ReferenceItem[]
  regulatoryContext?: "law" | "jurisprudence" | "doctrine" | "general"
}

// Conexão (Edge) recebida/enviada para o FastAPI
export interface Relationship {
  id: string
  source: string
  target: string
  label?: "SIM" | "NÃO"
}

// Caso Decisório completo retornado do FastAPI
export interface CaseItem {
  id: string
  title: string
  nodes: DecisionNode[]
  edges: Relationship[]
  createdAt?: string
}

// Tipos adaptados para o canvas do @xyflow/react
export type FlowNode = RFNode<{
  title: string
  description: string
  references: ReferenceItem[]
  regulatoryContext?: "law" | "jurisprudence" | "doctrine" | "general"
  type: "decision" | "result"
}>

export type FlowEdge = RFEdge & {
  label?: "SIM" | "NÃO"
}
