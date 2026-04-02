import { Rect } from 'react-konva'
import { useEditorStore } from '@/stores/editor-store'

export function SelectionOverlay() {
  const selectionRect = useEditorStore((s) => s.selectionRect)
  if (!selectionRect || !selectionRect.visible) return null

  return (
    <Rect
      x={selectionRect.x}
      y={selectionRect.y}
      width={selectionRect.width}
      height={selectionRect.height}
      fill="rgba(96, 165, 250, 0.08)"
      stroke="#60a5fa"
      strokeWidth={1}
      dash={[4, 4]}
      listening={false}
    />
  )
}
