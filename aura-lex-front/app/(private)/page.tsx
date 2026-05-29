import * as React from "react"
import { SidebarCases } from "./_components/sidebar-cases"
import { MainContentWrapper } from "./_components/main-content-wrapper"
import { LayersPanel } from "./_components/layers-panel"
import { NodeDetails } from "./_components/node-details"
import { LoadingScreen } from "./_components/loading-screen"

export default function DecisionTreeDashboard() {
  return (
    <div className="h-screen w-screen flex overflow-hidden bg-zinc-50 dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-100">
      
      {/* 1. SIDEBAR ESQUERDA - Casos em Andamento & Perfil (Client Component) */}
      <SidebarCases />

      {/* 2. ÁREA CENTRAL - Canvas interativo, Header e Chat (Wrapper Client Component) */}
      <MainContentWrapper />

      {/* 3. SIDEBAR DIREITA - Árvore de Camadas Figma-style (Client Component) */}
      <LayersPanel />

      {/* 4. MODAL/DRAWER DE DETALHES DO NÓ (Client Component - Shadcn Sheet) */}
      <NodeDetails />

      {/* 5. TELA DE SKELETONS BLOQUEANTES DE LOADING (Client Component) */}
      <LoadingScreen />

    </div>
  )
}
