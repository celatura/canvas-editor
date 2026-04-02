import { useRef, useEffect } from 'react'
import { Transformer } from 'react-konva'
import type Konva from 'konva'
import { useEditorStore } from '@/stores/editor-store'

export function SelectionTransformer() {
  const trRef = useRef<Konva.Transformer>(null)
  const selectedIds = useEditorStore((s) => s.selectedIds)
  const tool = useEditorStore((s) => s.tool)

  useEffect(() => {
    const tr = trRef.current
    if (!tr) return
    const stage = tr.getStage()
    if (!stage) return

    if (tool !== 'select' || selectedIds.length === 0) {
      tr.nodes([])
      tr.getLayer()?.batchDraw()
      return
    }

    const nodes: Konva.Node[] = []
    for (const id of selectedIds) {
      const node = stage.findOne(`#${id}`)
      if (node) nodes.push(node)
    }
    tr.nodes(nodes)
    tr.getLayer()?.batchDraw()
  }, [selectedIds, tool])

  return (
    <Transformer
      ref={trRef}
      boundBoxFunc={(oldBox, newBox) => {
        if (newBox.width < 5 || newBox.height < 5) return oldBox
        return newBox
      }}
      borderStroke="#60a5fa"
      borderStrokeWidth={1.5}
      anchorStroke="#60a5fa"
      anchorFill="#1e293b"
      anchorSize={8}
      anchorCornerRadius={2}
      rotateAnchorOffset={20}
      enabledAnchors={[
        'top-left',
        'top-right',
        'bottom-left',
        'bottom-right',
        'middle-left',
        'middle-right',
        'top-center',
        'bottom-center',
      ]}
      keepRatio={false}
      rotateEnabled={true}
    />
  )
}
