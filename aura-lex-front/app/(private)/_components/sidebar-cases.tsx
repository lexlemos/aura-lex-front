"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Plus,
  Trash2,
  Settings,
  LogOut,
  GitFork,
  Scale,
  X,
  PanelLeftClose
} from "lucide-react"
import { useGraphStore } from "@/lib/store"

export function SidebarCases() {
  const router = useRouter()
  const {
    cases,
    activeCaseId,
    setActiveCaseId,
    addNewCase,
    deleteCase,
    isLeftSidebarOpen,
    toggleLeftSidebar,
  } = useGraphStore()

  const [isProfileOpen, setIsProfileOpen] = React.useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false)

  // Ocultar barras por padrão em telas pequenas (< 1024px)
  React.useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      useGraphStore.setState({ isLeftSidebarOpen: false, isRightSidebarOpen: false })
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("auth")
    router.push("/login")
  }

  return (
    <>
      <aside className={`shrink-0 bg-zinc-950 text-zinc-200 flex flex-col h-full z-30 relative transition-all duration-300 ease-in-out ${
        isLeftSidebarOpen ? "w-[280px] translate-x-0 border-r border-zinc-850" : "w-0 -translate-x-full border-r-0 overflow-hidden"
      }`}>
        <div className="p-4 flex flex-col gap-4 min-w-[280px]">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-indigo-400 fill-indigo-400/20" />
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-indigo-200 to-indigo-400 bg-clip-text text-transparent">
                Aura Lex Grafos
              </span>
            </div>
            <button
              onClick={toggleLeftSidebar}
              className="p-1.5 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
              title="Recolher painel"
            >
              <PanelLeftClose className="h-4.5 w-4.5" />
            </button>
          </div>

          <button
            onClick={() => addNewCase(`Novo Caso Decisório ${cases.length + 1}`)}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-100 border border-zinc-800 hover:border-zinc-700 transition-all font-medium text-sm shadow-sm group cursor-pointer"
          >
            <Plus className="h-4 w-4 text-zinc-400 group-hover:text-zinc-100 transition-colors" />
            Novo Caso
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <div className="px-3 py-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            Casos em Andamento
          </div>
          {cases.map((c) => (
            <div
              key={c.id}
              onClick={() => setActiveCaseId(c.id)}
              className={`group flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
                c.id === activeCaseId
                  ? "bg-zinc-900 text-white font-medium shadow-sm"
                  : "text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-100"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <GitFork className="h-4 w-4 shrink-0 text-zinc-500 group-hover:text-zinc-400" />
                <span className="truncate text-sm">{c.title}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  deleteCase(c.id)
                }}
                className="opacity-0 group-hover:opacity-100 hover:text-red-400 p-1 rounded transition-all shrink-0 cursor-pointer"
                title="Deletar caso"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Profile Popover */}
        {isProfileOpen && (
          <div className="absolute bottom-20 left-4 right-4 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-2 flex flex-col gap-1 z-35 animate-in slide-in-from-bottom-2 duration-150">
            <button
              onClick={() => {
                setIsSettingsOpen(true)
                setIsProfileOpen(false)
              }}
              className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer flex items-center gap-2"
            >
              <Settings className="h-3.5 w-3.5" />
              Configurações da Conta
            </button>
            <div className="h-[1px] bg-zinc-800 my-1" />
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg hover:bg-red-500/10 text-red-450 hover:text-red-400 transition-colors cursor-pointer flex items-center gap-2"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sair da Conta
            </button>
          </div>
        )}

        <div 
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className="p-4 border-t border-zinc-850 bg-zinc-950/80 flex items-center gap-3 cursor-pointer hover:bg-zinc-900/40 transition-colors"
        >
          <div className="h-9 w-9 rounded-full bg-indigo-650 flex items-center justify-center text-white font-semibold text-sm">
            AL
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-semibold text-zinc-100 truncate">Allex Lemes</span>
            <span className="text-xs text-zinc-500 truncate">allex@auralex.com</span>
          </div>
          <Settings className="h-4 w-4 text-zinc-500 hover:text-zinc-350 transition-colors" />
        </div>
      </aside>

      {/* MODAL DE CONFIGURAÇÕES DE CONTA */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-in zoom-in-95 duration-200 text-zinc-900 dark:text-zinc-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold">Configurações da Conta</h3>
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4 text-zinc-400" />
              </button>
            </div>
            <p className="text-sm text-zinc-550 dark:text-zinc-450 mb-6">
              Gerencie as preferências da sua conta e do visualizador de grafos jurídicos.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-1">NOME COMPLETO</label>
                <input
                  type="text"
                  defaultValue="Allex Lemes"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-855 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-1">E-MAIL</label>
                <input
                  type="email"
                  defaultValue="allex@auralex.com"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-855 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-1">TEMA DO INTERFACE</label>
                <select className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent focus:outline-none dark:bg-zinc-900 text-zinc-855 dark:text-zinc-100">
                  <option>Escuro (Padrão)</option>
                  <option>Claro</option>
                  <option>Seguir Sistema</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-2 text-xs font-bold rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-indigo-650 hover:bg-indigo-700 text-white cursor-pointer"
              >
                Salvar Configurações
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
