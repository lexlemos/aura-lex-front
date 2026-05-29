import { useState, useCallback, DragEvent } from "react"

const ALLOWED_EXTENSIONS = [".pdf", ".txt", ".docx"]
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "text/plain",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_FILE_COUNT = 5

export function useFileUpload() {
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isDragActive, setIsDragActive] = useState(false)

  const validateFiles = useCallback(
    (incomingFiles: File[], currentFiles: File[]): { valid: File[]; errorMsg: string | null } => {
      let errorMsg: string | null = null
      const valid: File[] = []

      // Verifica se o limite total de arquivos foi excedido
      if (currentFiles.length + incomingFiles.length > MAX_FILE_COUNT) {
        return {
          valid: [],
          errorMsg: `Você só pode anexar no máximo ${MAX_FILE_COUNT} arquivos.`,
        }
      }

      for (const file of incomingFiles) {
        // Valida extensão e tipo MIME
        const lastDotIndex = file.name.lastIndexOf(".")
        const extension = lastDotIndex !== -1 ? file.name.slice(lastDotIndex).toLowerCase() : ""
        const isValidExtension = ALLOWED_EXTENSIONS.includes(extension)
        const isValidMime = ALLOWED_MIME_TYPES.includes(file.type)

        if (!isValidExtension && !isValidMime) {
          errorMsg = "Apenas arquivos PDF, TXT ou DOCX são permitidos."
          continue
        }

        // Valida tamanho
        if (file.size > MAX_FILE_SIZE) {
          errorMsg = `O arquivo "${file.name}" ultrapassa o limite de 10MB.`
          continue
        }

        // Evita duplicados na fila
        const isDuplicate = currentFiles.some(
          (f) => f.name === file.name && f.size === file.size
        )
        if (!isDuplicate) {
          valid.push(file)
        }
      }

      return { valid, errorMsg }
    },
    []
  )

  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      setError(null)
      const fileList = Array.from(newFiles)

      setFiles((prev) => {
        const { valid, errorMsg } = validateFiles(fileList, prev)
        if (errorMsg) {
          setError(errorMsg)
        }
        return [...prev, ...valid]
      })
    },
    [validateFiles]
  )

  const removeFile = useCallback((index: number) => {
    setError(null)
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const clearFiles = useCallback(() => {
    setError(null)
    setFiles([])
  }, [])

  // Handlers para o drag-and-drop
  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(true)
  }, [])

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
  }, [])

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragActive(false)

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files)
      }
    },
    [addFiles]
  )

  return {
    files,
    error,
    setError,
    isDragActive,
    addFiles,
    removeFile,
    clearFiles,
    dragHandlers: {
      onDragEnter: handleDragEnter,
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
    },
  }
}
