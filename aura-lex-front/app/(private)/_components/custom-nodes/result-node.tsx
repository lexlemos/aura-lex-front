"use client"

import * as React from "react"
import { Handle, Position, NodeProps } from "@xyflow/react"
import { CheckCircle2 } from "lucide-react"
import { FlowNode } from "@/types/graph"

export function ResultNodeComponent({ data, selected }: NodeProps<FlowNode>) {
  // Ajuste visual para destacar se é um resultado positivo ou neutro
  const isPositive = data.title.toLowerCase().includes("procedente") || 
                     data.title.toLowerCase().includes("mantida") || 
                     data.title.toLowerCase().includes("deferido")

  const borderStyles = selected
    ? "border-indigo-500 ring-2 ring-indigo-500/20"
    : isPositive
      ? "border-emerald-500/30 dark:border-emerald-500/20 hover:border-emerald-500 dark:hover:border-emerald-400"
      : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700"

  const badgeStyles = isPositive
    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-450"
    : "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400"

  return (
    <div
      className={`w-[220px] rounded-xl border bg-white dark:bg-zinc-900 p-4 transition-all duration-200 flex flex-col gap-2 select-none text-left shadow-sm ${borderStyles}`}
    >
      {/* Target handle no topo (Sem Source handle na base já que é um nó folha/resultado) */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2.5 !h-2.5 !bg-zinc-300 dark:!bg-zinc-700 !border-2 !border-white dark:!border-zinc-900"
      />

      <div className="flex items-center justify-between">
        <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wide flex items-center gap-1 ${badgeStyles}`}>
          <CheckCircle2 className="h-3 w-3 shrink-0" />
          <span>Resultado</span>
        </span>
      </div>

      <h4 className="font-bold text-sm tracking-tight truncate text-zinc-900 dark:text-zinc-50">
        {data.title}
      </h4>

      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed min-h-[40px] break-words line-clamp-3">
        {data.description}
      </p>
    </div>
  )
}
