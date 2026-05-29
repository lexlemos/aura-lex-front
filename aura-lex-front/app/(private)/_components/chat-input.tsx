"use client"

import * as React from "react"
import { Paperclip, Send, FileText, X, UploadCloud, AlertCircle } from "lucide-react"
import { useGraphStore } from "@/lib/store"
import { useTextareaResize } from "@/hooks/use-textarea-resize"
import { useFileUpload } from "@/hooks/use-file-upload"

export function ChatInput() {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [prompt, setPrompt] = React.useState("")

  const { fetchLegalQuery, isGenerating, error: globalError, setError: setGlobalError } = useGraphStore()

  const {
    files,
    error: fileError,
    setError: setFileError,
    isDragActive,
    addFiles,
    removeFile,
    clearFiles,
    dragHandlers,
  } = useFileUpload()

  // Redimensionamento automático do textarea (limite de 180px de altura)
  useTextareaResize(textareaRef, prompt, 180)

  const handleFormSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    // Evita envio se estiver vazio ou processando
    if ((!prompt.trim() && files.length === 0) || isGenerating) return

    const queryText = prompt
    const attachedFiles = [...files]

    // Limpa os estados locais do chat
    setPrompt("")
    clearFiles()

    try {
      await fetchLegalQuery(queryText, attachedFiles)
    } catch (err) {
      console.error("Erro ao enviar prompt jurídico:", err)
    }
  }

  // Atalhos de teclado: Enter envia, Shift+Enter quebra linha
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleFormSubmit()
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files)
    }
  }

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Estiliza chips de arquivo conforme sua extensão
  const getFileBadgeColor = (fileName: string) => {
    const lastDotIndex = fileName.lastIndexOf(".")
    const ext = lastDotIndex !== -1 ? fileName.slice(lastDotIndex).toLowerCase() : ""

    if (ext === ".pdf") {
      return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
    }
    if (ext === ".docx") {
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
    }
    return "bg-zinc-500/10 text-zinc-700 dark:text-zinc-400 border-zinc-500/20"
  }

  return (
    <div className="relative w-full">

      {/* Container de Alertas de Erro */}
      {(globalError || fileError) && (
        <div className="absolute bottom-full left-0 right-0 mb-3 flex flex-col gap-2 z-35">
          {globalError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs text-red-600 dark:text-red-400 flex items-start gap-2 animate-in slide-in-from-bottom-2 duration-200">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div className="flex-1 flex justify-between items-center gap-2">
                <span>{globalError}</span>
                <button
                  type="button"
                  onClick={() => setGlobalError(null)}
                  className="text-red-500 hover:text-red-700 p-0.5 rounded cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {fileError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs text-red-600 dark:text-red-400 flex items-start gap-2 animate-in slide-in-from-bottom-2 duration-200">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div className="flex-1 flex justify-between items-center gap-2">
                <span>{fileError}</span>
                <button
                  type="button"
                  onClick={() => setFileError(null)}
                  className="text-red-500 hover:text-red-700 p-0.5 rounded cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Container Principal / Drag Drop Zone */}
      <form
        onSubmit={handleFormSubmit}
        {...dragHandlers}
        className={`relative bg-white dark:bg-zinc-900 border rounded-2xl shadow-2xl flex flex-col p-2.5 transition-all duration-200 focus-within:ring-2 focus-within:ring-indigo-500/20 dark:focus-within:ring-indigo-400/20 ${isDragActive
          ? "border-indigo-500 dark:border-indigo-400 bg-indigo-50/5 dark:bg-indigo-950/5 scale-[1.01]"
          : "border-zinc-200 dark:border-zinc-800 focus-within:border-indigo-500/60 dark:focus-within:border-indigo-400/60"
          }`}
      >

        {/* Overlay Visual do Drag e Drop */}
        {isDragActive && (
          <div className="absolute inset-0 bg-zinc-950/40 dark:bg-zinc-950/60 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center gap-2 text-indigo-400 pointer-events-none animate-in fade-in duration-150 z-20">
            <UploadCloud className="h-8 w-8 animate-bounce" />
            <span className="text-xs font-semibold">Solte seus arquivos PDF, TXT ou DOCX aqui</span>
          </div>
        )}

        {/* Fila de arquivos anexados */}
        {files.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-2 pb-2 border-b border-zinc-100 dark:border-zinc-850 mb-2">
            {files.map((file, idx) => (
              <div
                key={`${file.name}-${idx}`}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${getFileBadgeColor(file.name)}`}
              >
                <FileText className="h-3.5 w-3.5 shrink-0" />
                <span className="max-w-[120px] truncate">{file.name}</span>
                <span className="text-[10px] opacity-60">({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="hover:bg-zinc-500/20 p-0.5 rounded-md transition-colors cursor-pointer"
                  title="Remover arquivo"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Linha de digitação e botões de ação */}
        <div className="flex items-end gap-2">

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            multiple
            accept=".pdf,.txt,.docx"
            className="hidden"
          />

          {/* Botão de Clipe para Anexo (Adicionado mb-1) */}
          <button
            type="button"
            onClick={triggerFileInput}
            disabled={isGenerating}
            className="mb-1 h-10 w-10 rounded-xl text-zinc-400 hover:text-zinc-650 hover:bg-zinc-100 dark:text-zinc-500 dark:hover:text-zinc-300 dark:hover:bg-zinc-800 flex items-center justify-center transition-all shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            title="Anexar arquivos (PDF, TXT, DOCX)"
          >
            <Paperclip className="h-4.5 w-4.5" />
          </button>

          {/* Textarea Expansível (Mantido intacto) */}
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isGenerating
                ? "Aguarde, a IA está gerando o grafo..."
                : "Digite o caso legal ou anexe documentos para estruturar a árvore de decisões..."
            }
            disabled={isGenerating}
            rows={1}
            className="flex-1 bg-transparent px-2 py-2 text-sm focus:outline-none border-none placeholder-zinc-450 dark:placeholder-zinc-500 text-zinc-900 dark:text-zinc-150 resize-none min-h-[40px] max-h-[180px] leading-relaxed disabled:opacity-50 disabled:cursor-not-allowed"
          />

          {/* Botão de Enviar (Adicionado mb-1 para manter simetria) */}
          <button
            type="submit"
            disabled={(!prompt.trim() && files.length === 0) || isGenerating}
            className="mb-1 h-10 w-10 rounded-xl bg-indigo-650 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white flex items-center justify-center transition-all shrink-0 shadow-md cursor-pointer disabled:bg-zinc-100 dark:disabled:bg-zinc-800 disabled:text-zinc-400 dark:disabled:text-zinc-600 disabled:shadow-none disabled:cursor-not-allowed"
            title="Enviar para análise"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  )
}
