"use client"

import * as React from "react"
import { useGraphStore } from "@/lib/store"
import { ChatInput } from "./chat-input"
import { HeaderInfo } from "./header-info"
import { GraphViewer } from "./graph-viewer"

export function MainContentWrapper() {
  const { isRightSidebarOpen } = useGraphStore()

  return (
    <main
      className={`flex-1 flex flex-col h-full relative bg-zinc-50 dark:bg-zinc-900 overflow-hidden transition-all duration-300 ${
        isRightSidebarOpen ? "lg:pr-[300px]" : "pr-0"
      }`}
    >
      {/* Header com as informações do caso ativo e botões de expansão */}
      <header className="h-14 border-b border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md px-6 flex items-center justify-between z-10 shrink-0">
        <HeaderInfo />
      </header>

      {/* Canvas interativo do React Flow */}
      <GraphViewer />

      {/* Input de Chat e Upload centralizado reativamente com base nas sidebars */}
      <div
        className={`absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md md:max-w-xl lg:max-w-2xl px-4 z-10 transition-all duration-300 ${
          isRightSidebarOpen ? "lg:left-[calc(50%-140px)]" : ""
        }`}
      >
        <ChatInput />
      </div>
    </main>
  )
}
