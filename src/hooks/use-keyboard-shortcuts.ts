import { useEffect } from 'react'
import { useEditorStore } from '@/stores/editor-store'

export function useKeyboardShortcuts() {
  const { tool, setTool, undo, redo, canUndo, canRedo, selectedIds, removeObjects, pushHistory } =
    useEditorStore()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't intercept when typing in inputs
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      const ctrl = e.ctrlKey || e.metaKey

      // Undo/Redo
      if (ctrl && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        if (canUndo()) undo()
        return
      }
      if (ctrl && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        if (canRedo()) redo()
        return
      }

      // Delete selection
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.length > 0) {
        e.preventDefault()
        pushHistory()
        removeObjects(selectedIds)
        return
      }

      // Tool shortcuts
      if (!ctrl) {
        switch (e.key.toLowerCase()) {
          case 'b':
          case 'p':
            setTool('draw')
            break
          case 'e':
            setTool('eraser')
            break
          case 'v':
            setTool('select')
            break
          case 't':
            setTool('text')
            break
          case 'escape':
            setTool('select')
            break
        }
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [tool, setTool, undo, redo, canUndo, canRedo, selectedIds, removeObjects, pushHistory])
}
