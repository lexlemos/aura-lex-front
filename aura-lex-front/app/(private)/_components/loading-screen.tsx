"use client"

import * as React from "react"
import { Sparkles, Scale, FileText, Layout } from "lucide-react"
import { useGraphStore } from "@/lib/store"

const LOADING_STATUSES = [
  { text: "Enviando consulta para a inteligência artificial...", icon: <Scale className="h-5 w-5" /> },
  { text: "Lendo documentos e extraindo termos jurídicos...", icon: <FileText className="h-5 w-5" /> },
  { text: "Mapeando leis, jurisprudências e citações correlatas...", icon: <Sparkles className="h-5 w-5" /> },
  { text: "Calculando ramificações e hipóteses lógicas...", icon: <Layout className="h-5 w-5" /> },
  { text: "Renderizando árvore de decisão interativa...", icon: <Layout className="h-5 w-5" /> }
]

export function LoadingScreen() {
  const { isGenerating } = useGraphStore()
  const [statusIdx, setStatusIdx] = React.useState(0)

  // Alterna as mensagens de loading a cada 3.5 segundos para melhorar a experiência
  React.useEffect(() => {
    if (!isGenerating) {
      const timer = setTimeout(() => setStatusIdx(0), 0)
      return () => clearTimeout(timer)
    }

    const interval = setInterval(() => {
      setStatusIdx((prev) => (prev + 1) % LOADING_STATUSES.length)
    }, 3500)

    return () => clearInterval(interval)
  }, [isGenerating])

  if (!isGenerating) return null

  const currentStatus = LOADING_STATUSES[statusIdx]

  return (
    <div className="fixed inset-0 bg-zinc-950/75 backdrop-blur-md z-50 flex items-center justify-center animate-in fade-in duration-300">
      
      {/* Container Principal */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-md w-full flex flex-col items-center gap-6 text-center shadow-2xl relative overflow-hidden">
        
        {/* Glow de fundo */}
        <div className="absolute -top-12 -left-12 h-24 w-24 bg-indigo-500/20 rounded-full blur-2xl animate-pulse" />
        <div className="absolute -bottom-12 -right-12 h-24 w-24 bg-purple-500/20 rounded-full blur-2xl animate-pulse" />

        {/* Círculo Animado com Ícone Central */}
        <div className="relative h-16 w-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner group">
          <div className="absolute inset-0 rounded-2xl border border-indigo-400/50 animate-ping opacity-35" />
          <div className="animate-pulse">
            {currentStatus.icon}
          </div>
        </div>

        {/* Texto do Status */}
        <div className="space-y-2 relative z-10 w-full">
          <h3 className="text-base font-bold text-zinc-150 tracking-tight">
            Estruturando Grafo Jurídico
          </h3>
          <div className="h-10 flex items-center justify-center">
            <p className="text-xs text-zinc-400 leading-relaxed max-w-[280px] animate-pulse">
              {currentStatus.text}
            </p>
          </div>
        </div>

        {/* Esqueletos Pulssantes Simulando um Card de Nó */}
        <div className="w-full bg-zinc-950/40 border border-zinc-850 rounded-xl p-4 space-y-3 relative z-10">
          <div className="flex items-center justify-between">
            <div className="h-3 w-16 bg-zinc-800 rounded animate-pulse" />
            <div className="h-3 w-3 bg-zinc-800 rounded-full animate-pulse" />
          </div>
          <div className="h-4 w-3/4 bg-zinc-800 rounded animate-pulse" />
          <div className="space-y-1.5 pt-1">
            <div className="h-2.5 w-full bg-zinc-800/80 rounded animate-pulse" />
            <div className="h-2.5 w-5/6 bg-zinc-800/80 rounded animate-pulse" />
          </div>
        </div>

        {/* Barra de Progresso Infinita Premium */}
        <div className="relative w-full h-1 bg-zinc-800/60 rounded-full overflow-hidden">
          <div className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-full w-1/3 animate-[loading-bar_1.8s_infinite_linear]" />
        </div>

      </div>

      {/* Estilos inline para o keyframe do progresso, garantindo compatibilidade sem mexer no globals.css */}
      <style jsx global>{`
        @keyframes loading-bar {
          0% {
            left: -33%;
          }
          100% {
            left: 100%;
          }
        }
      `}</style>

    </div>
  )
}
