"use client"

import * as React from "react"
import { Scale, FileText, Gavel, BookOpen, ExternalLink, Calendar } from "lucide-react"
import { useGraphStore } from "@/lib/store"
import { ReferenceItem } from "@/types/graph"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"

export function NodeDetails() {
  const { 
    focusedNodeId, 
    readingNodeData, 
    setFocusedNodeId, 
    setReadingNodeData 
  } = useGraphStore()

  // Sincroniza fechamento com a limpeza de estado no Zustand
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setFocusedNodeId(null)
      setReadingNodeData(null)
    }
  }

  // Estilização das chips de fundamentação legal (Lei, Doutrina, Jurisprudência)
  const renderReferenceChip = (refItem: ReferenceItem) => {
    const colors = {
      law: "bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30",
      jurisprudence: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30",
      doctrine: "bg-purple-500/10 text-purple-600 border-purple-500/20 hover:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/30",
    }

    const icons = {
      law: <FileText className="h-3.5 w-3.5 shrink-0" />,
      jurisprudence: <Gavel className="h-3.5 w-3.5 shrink-0" />,
      doctrine: <BookOpen className="h-3.5 w-3.5 shrink-0" />,
    }

    const chipContent = (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold cursor-pointer transition-colors ${colors[refItem.type]}`}>
        {icons[refItem.type]}
        <span>{refItem.title}</span>
        {refItem.url && <ExternalLink className="h-3 w-3 opacity-60 shrink-0" />}
      </span>
    )

    if (refItem.url) {
      return (
        <a 
          key={refItem.id} 
          href={refItem.url} 
          target="_blank" 
          rel="noreferrer" 
          className="no-underline focus:outline-none"
        >
          {chipContent}
        </a>
      )
    }

    return <span key={refItem.id}>{chipContent}</span>
  }

  return (
    <Sheet open={!!focusedNodeId} onOpenChange={handleOpenChange}>
      <SheetContent className="w-full sm:max-w-md bg-zinc-950/95 dark:bg-zinc-950/95 border-l border-zinc-800 text-zinc-100 flex flex-col h-full shadow-2xl p-0">
        
        {readingNodeData ? (
          <>
            {/* Header da Sheet */}
            <SheetHeader className="p-6 border-b border-zinc-850 flex flex-col gap-2.5 text-left">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md tracking-wide ${
                  readingNodeData.type === "decision"
                    ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                    : "bg-zinc-550/10 text-zinc-400 border border-zinc-550/20"
                }`}>
                  {readingNodeData.type === "decision" ? "Decisão" : "Resultado"}
                </span>
                
                {readingNodeData.regulatoryContext && readingNodeData.regulatoryContext !== "general" && (
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {readingNodeData.regulatoryContext === "law" ? "Lei" :
                     readingNodeData.regulatoryContext === "jurisprudence" ? "Jurisprudência" : "Doutrina"}
                  </span>
                )}
              </div>
              
              <SheetTitle className="text-lg font-bold tracking-tight text-zinc-50">
                {readingNodeData.title}
              </SheetTitle>
            </SheetHeader>

            {/* Conteúdo Principal com Rolagem de Altura Limite */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-zinc-850">
              
              {/* Descrição Jurídica Completa */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider">
                  Descrição do Nó
                </h4>
                <div className="text-sm text-zinc-300 leading-relaxed font-medium bg-zinc-900/40 border border-zinc-850 rounded-xl p-4">
                  {readingNodeData.description}
                </div>
              </div>

              {/* Seção Fundamentação Normativa */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider flex items-center gap-1.5">
                  <Scale className="h-4 w-4 text-indigo-500" />
                  Fontes & Fundamentação Jurídica
                </h4>
                
                {readingNodeData.references && readingNodeData.references.length > 0 ? (
                  <div className="flex flex-wrap gap-2.5">
                    {readingNodeData.references.map(renderReferenceChip)}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-550 italic bg-zinc-900/30 rounded-xl p-3 border border-zinc-850/50">
                    Nenhuma citação legal ou doutrinária vinculada a este nó decisório.
                  </p>
                )}
              </div>

              {/* Metadados adicionais */}
              <div className="bg-zinc-900/30 border border-zinc-850/50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Análise de IA atualizada automaticamente.</span>
                </div>
              </div>

            </div>

            {/* Rodapé e Fechamento */}
            <SheetFooter className="p-4 border-t border-zinc-850 flex justify-end bg-zinc-900/20 mt-auto">
              <SheetClose asChild>
                <button
                  type="button"
                  className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-350 hover:text-zinc-100 border border-zinc-800 hover:border-zinc-700 font-bold text-xs cursor-pointer transition-all shadow-sm"
                >
                  Fechar Detalhes
                </button>
              </SheetClose>
            </SheetFooter>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-450 gap-2">
            <div className="h-5 w-5 rounded-full border-2 border-zinc-550 border-t-transparent animate-spin" />
            <span className="text-xs">Carregando detalhes do nó...</span>
          </div>
        )}

      </SheetContent>
    </Sheet>
  )
}
