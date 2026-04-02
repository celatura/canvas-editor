import { useEffect, useRef } from 'react'
import { useEditorStore } from '@/stores/editor-store'

const AUTO_SAVE_INTERVAL = 5000

export function usePersistence() {
  const persist = useEditorStore((s) => s.persist)
  const hydrate = useEditorStore((s) => s.hydrate)
  const initialized = useRef(false)

  // Hydrate on mount
  useEffect(() => {
    if (!initialized.current) {
      hydrate()
      initialized.current = true
    }
  }, [hydrate])

  // Auto save on interval
  useEffect(() => {
    const timer = setInterval(() => {
      persist()
    }, AUTO_SAVE_INTERVAL)
    return () => clearInterval(timer)
  }, [persist])

  // Save on beforeunload
  useEffect(() => {
    const handler = () => persist()
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [persist])
}
