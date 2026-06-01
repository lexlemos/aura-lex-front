"use client"

import React from "react"
import { AuthGuard } from "@/components/auth-guard"
import { ToastProvider } from "@/components/ui/toast-provider"

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      {children}
      {/* Sistema de feedback visual — renderiza toasts da store Zustand */}
      <ToastProvider />
    </AuthGuard>
  )
}
