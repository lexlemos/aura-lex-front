"use client"

import { X, PanelLeft, PanelRight } from "lucide-react"
import { useGraphStore } from "@/lib/store"

export function HeaderInfo() {
  const { 
    cases, 
    activeCaseId, 
    focusedNodeId, 
    setFocusedNodeId,
    isLeftSidebarOpen,
    toggleLeftSidebar,
    isRightSidebarOpen,
    toggleRightSidebar
  } = useGraphStore()

  const activeCase = cases.find((c) => c.id === activeCaseId) || cases[0]

  if (!activeCase) return null

  const focusedNode = activeCase.nodes.find((n) => n.id === focusedNodeId)

  return (
    <>
      <div className="flex items-center gap-2">
        {!isLeftSidebarOpen && (
          <button
            onClick={toggleLeftSidebar}
            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-555 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors mr-1 cursor-pointer"
            title="Expandir painel esquerdo"
          >
            <PanelLeft className="h-4.5 w-4.5" />
          </button>
        )}
        <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Caso /</span>
        <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100">{activeCase.title}</span>
      </div>
      
      <div className="flex items-center gap-4">
        {focusedNodeId && focusedNode && (
          <div className="text-xs text-zinc-500 flex items-center gap-1.5 animate-in fade-in duration-150">
            <span>Foco: </span>
            <span className="font-bold text-zinc-700 dark:text-zinc-300">
              {focusedNode.title}
            </span>
            <button 
              onClick={() => setFocusedNodeId(null)}
              className="hover:bg-zinc-200 dark:hover:bg-zinc-800 p-0.5 rounded cursor-pointer"
              title="Limpar foco"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
        
        {!isRightSidebarOpen && (
          <button
            onClick={toggleRightSidebar}
            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-555 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
            title="Expandir painel de camadas"
          >
            <PanelRight className="h-4.5 w-4.5" />
          </button>
        )}
      </div>
    </>
  )
}
