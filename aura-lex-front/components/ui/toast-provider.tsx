"use client"

/**
 * components/ui/toast-provider.tsx
 *
 * Sistema de feedback visual (Toasts) para a Aura Lex.
 * Lê o estado de `toasts[]` da store Zustand e renderiza notificações
 * no canto inferior direito da tela.
 *
 * Características:
 * - Auto-dismiss configurável por toast (default: 4000ms)
 * - Toasts de "loading" não são dispensados automaticamente
 * - Animações de entrada/saída via Tailwind (tw-animate-css)
 * - Ícones semânticos (lucide-react, já instalado)
 * - Nenhum dado sensível ou stack trace é exibido — apenas a mensagem
 *   normalizada pelo interceptor do Axios
 */

import * as React from "react"
import { CheckCircle2, XCircle, Info, Loader2, X } from "lucide-react"
import { useGraphStore } from "@/lib/store"
import type { Toast } from "@/lib/types/api"

// ──────────────────────────────────────────────────────────────────────────────
// Configuração visual por tipo de toast
// ──────────────────────────────────────────────────────────────────────────────

const TOAST_CONFIG: Record<
  Toast["type"],
  {
    icon: React.ReactNode
    containerClass: string
    iconClass: string
    defaultDuration: number | null
  }
> = {
  success: {
    icon: <CheckCircle2 className="h-5 w-5 shrink-0" />,
    containerClass:
      "bg-zinc-900 border-emerald-500/40 text-zinc-100 dark:bg-zinc-900",
    iconClass: "text-emerald-400",
    defaultDuration: 4000,
  },
  error: {
    icon: <XCircle className="h-5 w-5 shrink-0" />,
    containerClass:
      "bg-zinc-900 border-red-500/40 text-zinc-100 dark:bg-zinc-900",
    iconClass: "text-red-400",
    defaultDuration: 6000,
  },
  info: {
    icon: <Info className="h-5 w-5 shrink-0" />,
    containerClass:
      "bg-zinc-900 border-indigo-500/40 text-zinc-100 dark:bg-zinc-900",
    iconClass: "text-indigo-400",
    defaultDuration: 4000,
  },
  loading: {
    icon: <Loader2 className="h-5 w-5 shrink-0 animate-spin" />,
    containerClass:
      "bg-zinc-900 border-amber-500/40 text-zinc-100 dark:bg-zinc-900",
    iconClass: "text-amber-400",
    defaultDuration: null, // sem auto-dismiss
  },
}

// ──────────────────────────────────────────────────────────────────────────────
// Componente individual de Toast
// ──────────────────────────────────────────────────────────────────────────────

function ToastItem({ toast }: { toast: Toast }) {
  const dismissToast = useGraphStore((s) => s.dismissToast)
  const config = TOAST_CONFIG[toast.type]
  const duration = toast.duration ?? config.defaultDuration

  React.useEffect(() => {
    if (duration === null) return
    const timer = setTimeout(() => dismissToast(toast.id), duration)
    return () => clearTimeout(timer)
  }, [toast.id, duration, dismissToast])

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`
        flex items-start gap-3 px-4 py-3.5 rounded-xl border shadow-2xl
        min-w-[280px] max-w-[380px] w-full
        animate-in slide-in-from-bottom-3 fade-in duration-300
        ${config.containerClass}
      `}
    >
      <span className={config.iconClass}>{config.icon}</span>
      <p className="text-sm font-medium leading-snug flex-1 text-zinc-100">
        {toast.message}
      </p>
      {toast.type !== "loading" && (
        <button
          onClick={() => dismissToast(toast.id)}
          aria-label="Fechar notificação"
          className="shrink-0 p-0.5 rounded hover:bg-zinc-700 transition-colors cursor-pointer"
        >
          <X className="h-3.5 w-3.5 text-zinc-500 hover:text-zinc-300" />
        </button>
      )}
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// Provider — renderiza a pilha de toasts
// ──────────────────────────────────────────────────────────────────────────────

export function ToastProvider() {
  const toasts = useGraphStore((s) => s.toasts)

  if (toasts.length === 0) return null

  return (
    <div
      aria-label="Notificações"
      className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2.5 items-end"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  )
}
