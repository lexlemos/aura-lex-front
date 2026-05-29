"use client"

import * as React from "react"
import dagre from "dagre"
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  useReactFlow,
  Panel
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"

import { useGraphStore } from "@/lib/store"
import { FlowNode, FlowEdge } from "@/types/graph"
import { DecisionNodeComponent } from "./custom-nodes/decision-node"
import { ResultNodeComponent } from "./custom-nodes/result-node"

// Registrar os nós customizados
const nodeTypes = {
  decision: DecisionNodeComponent,
  result: ResultNodeComponent,
}

// Algoritmo Dagre Auto-Layout
const getLayoutedElements = (
  nodes: FlowNode[],
  edges: FlowEdge[],
  direction = "TB"
): { nodes: FlowNode[]; edges: FlowEdge[] } => {
  const g = new dagre.graphlib.Graph()
  g.setGraph({ rankdir: direction, nodesep: 150, ranksep: 120 })
  g.setDefaultEdgeLabel(() => ({}))

  nodes.forEach((node) => {
    g.setNode(node.id, { width: 220, height: 110 })
  })

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target)
  })

  dagre.layout(g)

  const positionedNodes = nodes.map((node) => {
    const nodeInfo = g.node(node.id)
    return {
      ...node,
      position: {
        x: nodeInfo.x - 110,
        y: nodeInfo.y - 55,
      },
    }
  })

  return { nodes: positionedNodes, edges }
}

// Componente Interno que usa hooks do ReactFlowProvider
function FlowCanvas() {
  const { fitView, setCenter, getNode } = useReactFlow()
  
  const {
    cases,
    activeCaseId,
    focusedNodeId,
    setFocusedNodeId,
    setReadingNodeData,
  } = useGraphStore()

  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<FlowEdge>([])

  const activeCase = cases.find((c) => c.id === activeCaseId) || cases[0]

  // Sincroniza a store com a estrutura do React Flow ao alterar o caso
  React.useEffect(() => {
    if (!activeCase) return

    // Mapeia nós raw para nós do React Flow
    const flowNodes: FlowNode[] = activeCase.nodes.map((node) => {
      let context: "law" | "jurisprudence" | "doctrine" | "general" = "general"
      if (node.references && node.references.length > 0) {
        context = node.references[0].type
      }

      return {
        id: node.id,
        type: node.type,
        position: { x: 0, y: 0 },
        data: {
          title: node.title,
          description: node.description,
          references: node.references,
          regulatoryContext: context,
          type: node.type,
        },
      }
    })

    // Mapeia edges raw para edges do React Flow
    const flowEdges: FlowEdge[] = activeCase.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      type: "smoothstep",
      animated: true,
      style: { stroke: "#6366f1", strokeWidth: 2 },
      labelStyle: { 
        fill: edge.label === "SIM" ? "#10b981" : "#ef4444", 
        fontWeight: 700, 
        fontSize: 10 
      },
      labelBgPadding: [6, 4],
      labelBgBorderRadius: 4,
      labelBgStyle: { fill: "#18181b", fillOpacity: 0.8 },
    }))

    const layout = getLayoutedElements(flowNodes, flowEdges)

    const timer = setTimeout(() => {
      setNodes(layout.nodes)
      setEdges(layout.edges)
    }, 0)

    return () => clearTimeout(timer)
  }, [activeCase, setNodes, setEdges])

  // Ajusta o enquadramento ao alterar o caso ativo
  React.useEffect(() => {
    const timer = setTimeout(() => {
      fitView({ padding: 0.2, duration: 400 })
    }, 100)
    return () => clearTimeout(timer)
  }, [activeCaseId, fitView])

  // Centraliza e foca no nó selecionado (ex: ao clicar nas layers Figma)
  React.useEffect(() => {
    if (!focusedNodeId) return
    const node = getNode(focusedNodeId)
    if (node && node.position) {
      const timer = setTimeout(() => {
        setCenter(node.position.x + 110, node.position.y + 55, { zoom: 1.1, duration: 300 })
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [focusedNodeId, setCenter, getNode])

  // Ao clicar em um nó, preenche a store para abrir a Sheet e foca o nó
  const handleNodeClick = React.useCallback(
    (_event: React.MouseEvent, node: FlowNode) => {
      const rawNode = activeCase?.nodes.find((n) => n.id === node.id)
      if (rawNode) {
        setFocusedNodeId(node.id)
        setReadingNodeData(rawNode)
      }
    },
    [activeCase, setFocusedNodeId, setReadingNodeData]
  )

  const handlePaneClick = React.useCallback(() => {
    setFocusedNodeId(null)
  }, [setFocusedNodeId])

  if (!activeCase) {
    return (
      <div className="flex-1 flex items-center justify-center text-zinc-400">
        Nenhum caso ativo selecionado.
      </div>
    )
  }

  return (
    <div className="flex-1 relative bg-zinc-50 dark:bg-zinc-900 w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        fitView
        className="dark:bg-zinc-900"
      >
        {/* Controles do Canvas */}
        <Controls position="top-left" className="bg-white border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100" />
        <Background color="#3f3f46" gap={16} size={1} />
        
        {/* Minimapa */}
        <MiniMap 
          style={{ background: "#18181b" }}
          nodeColor={(node) => (node.type === "result" ? "#a1a1aa" : "#6366f1")}
          maskColor="rgba(24, 24, 27, 0.6)"
          className="border border-zinc-800 rounded-xl"
        />

        {/* Painel Flutuante Indicativo */}
        <Panel position="top-right" className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 rounded-lg text-[10px] text-zinc-500 font-bold tracking-wide uppercase select-none">
          Dagre Auto-Layout
        </Panel>
      </ReactFlow>
    </div>
  )
}

// Wrapper exportado com o Provider
export function GraphViewer() {
  return (
    <ReactFlowProvider>
      <FlowCanvas />
    </ReactFlowProvider>
  )
}
