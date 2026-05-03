// src/hooks/useToast.ts
import { useState, useCallback } from 'react'

interface ToastState {
  message: string
  type: 'success' | 'error' | 'info'
  key: number
}

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null)

  const show = useCallback((message: string, type: ToastState['type'] = 'success') => {
    setToast({ message, type, key: Date.now() })
    setTimeout(() => setToast(null), 3500)
  }, [])

  const hide = useCallback(() => setToast(null), [])

  return { toast, show, hide }
}
