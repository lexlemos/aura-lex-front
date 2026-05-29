"use client"

import * as React from "react"
import { Handle, Position, NodeProps } from "@xyflow/react"
import { Scale, Gavel, BookOpen } from "lucide-react"
import { FlowNode } from "@/types/graph"

export function DecisionNodeComponent({ data, selected }: NodeProps<FlowNode>) {
  const context = data?.regulatoryContext || "general"

  const getContextMeta = (ctx: string) => {
    const formatted = ctx.toLowerCase()

    if (formatted === "law" || formatted === "lei") {
      return {
        label: "Lei",
        icon: <Scale className="h-3 w-3 shrink-0" />,
        badgeStyles: "bg-blue-500/10 text-blue-600 dark:text-blue-450",
        borderStyles: selected
          ? "border-blue-500 ring-2 ring-blue-500/20"
          : "border-blue-500/30 hover:border-blue-500 dark:border-blue-500/20 dark:hover:border-blue-400",
      }
    }

    if (formatted === "jurisprudence" || formatted === "jurisprudência" || formatted === "jurisprudencia") {
      return {
        label: "Jurisprudência",
        icon: <Gavel className="h-3 w-3 shrink-0" />,
        badgeStyles: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-450",
        borderStyles: selected
          ? "border-emerald-500 ring-2 ring-emerald-500/20"
          : "border-emerald-500/30 hover:border-emerald-500 dark:border-emerald-500/20 dark:hover:border-emerald-400",
      }
    }

    if (formatted === "doctrine" || formatted === "doutrina") {
      return {
        label: "Doutrina",
        icon: <BookOpen className="h-3 w-3 shrink-0" />,
        badgeStyles: "bg-purple-500/10 text-purple-600 dark:text-purple-450",
        borderStyles: selected
          ? "border-purple-500 ring-2 ring-purple-500/20"
          : "border-purple-500/30 hover:border-purple-500 dark:border-purple-500/20 dark:hover:border-purple-400",
      }
    }

    // Default (Geral)
    return {
      label: "Decisão",
      icon: <Scale className="h-3 w-3 shrink-0 text-amber-500" />,
      badgeStyles: "bg-amber-500/10 text-amber-600 dark:text-amber-450",
      borderStyles: selected
        ? "border-amber-500 ring-2 ring-amber-500/20"
        : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700",
    }
  }

  const meta = getContextMeta(context)

  return (
    <div
      className={`w-[220px] rounded-xl border bg-white dark:bg-zinc-900 p-4 transition-all duration-200 flex flex-col gap-2 select-none text-left shadow-sm ${meta.borderStyles}`}
    >
      {/* Handles para conexões do React Flow */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2.5 !h-2.5 !bg-zinc-300 dark:!bg-zinc-700 !border-2 !border-white dark:!border-zinc-900"
      />

      <div className="flex items-center justify-between">
        <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wide flex items-center gap-1 ${meta.badgeStyles}`}>
          {meta.icon}
          <span>{meta.label}</span>
        </span>
      </div>

      <h4 className="font-bold text-sm tracking-tight truncate text-zinc-900 dark:text-zinc-50">
        {data?.title || ""}
      </h4>

      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed min-h-[40px] break-words line-clamp-3">
        {data?.description || ""}
      </p>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2.5 !h-2.5 !bg-zinc-300 dark:!bg-zinc-700 !border-2 !border-white dark:!border-zinc-900"
      />
    </div>
  )
}
