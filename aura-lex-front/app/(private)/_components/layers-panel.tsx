"use client"

import * as React from "react"
import { Layers, PanelRightClose } from "lucide-react"
import { useGraphStore } from "@/lib/store"
import { FileTree, TreeItem } from "@/components/file-tree"
import { DecisionNode } from "@/types/graph"

export function LayersPanel() {
  const { 
    cases, 
    activeCaseId, 
    setFocusedNodeId,
    isRightSidebarOpen,
    toggleRightSidebar,
  } = useGraphStore()

  const activeCase = cases.find((c) => c.id === activeCaseId) || cases[0]

  const handleLayerSelect = (layerName: string) => {
    if (!activeCase) return
    const matchedNode = activeCase.nodes.find(
      (n) => n.title.toLowerCase() === layerName.toLowerCase()
    )
    if (matchedNode) {
      setFocusedNodeId(matchedNode.id)
    }
  }

  const getFigmaLayersData = (): TreeItem[] => {
    if (!activeCase) return []
    const allNodes = activeCase.nodes
    const edges = activeCase.edges
    const roots = allNodes.filter((n) => !edges.some((e) => e.target === n.id))

    const buildSubTree = (node: DecisionNode): TreeItem => {
      const children = allNodes.filter((n) => edges.some((e) => e.source === node.id && e.target === n.id))
      if (children.length === 0) {
        return node.title
      }
      return [node.title, ...children.map(buildSubTree)]
    }

    return roots.map((root) => buildSubTree(root))
  }

  if (!activeCase) return null

  return (
    <aside className={`absolute top-6 bottom-6 w-[280px] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-20 transition-all duration-300 ease-in-out ${
      isRightSidebarOpen ? "right-6 opacity-100" : "-right-[320px] opacity-0 pointer-events-none"
    }`}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-150 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-zinc-400 dark:text-zinc-550" />
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-550 dark:text-zinc-400">
            Componentes (Layers)
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold">
            {activeCase.nodes.length} Nós
          </span>
          <button
            onClick={toggleRightSidebar}
            className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200 transition-colors cursor-pointer"
            title="Recolher painel"
          >
            <PanelRightClose className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <FileTree 
          data={getFigmaLayersData()} 
          onFileSelect={handleLayerSelect}
        />
      </div>
    </aside>
  )
}
