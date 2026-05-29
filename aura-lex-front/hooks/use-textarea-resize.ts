import { useEffect, RefObject } from "react"

/**
 * Hook customizado para redimensionar automaticamente a altura de um textarea
 * conforme o texto é digitado, limitando a uma altura máxima (maxHeight)
 * para evitar que cresça indefinidamente.
 */
export function useTextareaResize(
  textareaRef: RefObject<HTMLTextAreaElement | null>,
  value: string,
  maxHeight: number = 200
) {
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    // Reseta a altura para recalcular corretamente o scrollHeight
    textarea.style.height = "auto"
    
    const scrollHeight = textarea.scrollHeight
    if (scrollHeight > maxHeight) {
      textarea.style.height = `${maxHeight}px`
      textarea.style.overflowY = "auto"
    } else {
      textarea.style.height = `${scrollHeight}px`
      textarea.style.overflowY = "hidden"
    }
  }, [textareaRef, value, maxHeight])
}
