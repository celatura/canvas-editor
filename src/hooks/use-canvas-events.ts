import { useCallback, useRef } from 'react'
import type Konva from 'konva'
import type { KonvaEventObject } from 'konva/lib/Node'
import { v4 as uuid } from 'uuid'
import { useEditorStore } from '@/stores/editor-store'
import { createLineFromBrush } from '@/lib/canvas-utils'
import type { LineObject, EraserObject, CanvasObject } from '@/types'

export function useCanvasEvents() {
  const currentLineRef = useRef<CanvasObject | null>(null)
  const selectionStartRef = useRef<{ x: number; y: number } | null>(null)

  const {
    tool,
    brushConfig,
    eraserConfig,
    isDrawing,
    setIsDrawing,
    addObject,
    updateObject,
    pushHistory,
    setSelectedIds,
    clearSelection,
    setSelectionRect,
    getActiveObjects,
    selectedIds,
  } = useEditorStore()

  const handleMouseDown = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      const stage = e.target.getStage()
      if (!stage) return
      const pos = stage.getRelativePointerPosition()
      if (!pos) return

      if (tool === 'draw') {
        pushHistory()
        const lineProps = createLineFromBrush(brushConfig, pos.x, pos.y)
        const line: LineObject = {
          id: uuid(),
          type: 'line',
          x: 0,
          y: 0,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          visible: true,
          ...lineProps,
        }
        currentLineRef.current = line
        addObject(line)
        setIsDrawing(true)
      } else if (tool === 'eraser') {
        pushHistory()
        const eraser: EraserObject = {
          id: uuid(),
          type: 'eraser',
          x: 0,
          y: 0,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          visible: true,
          points: [pos.x, pos.y],
          strokeWidth: eraserConfig.strokeWidth,
        }
        currentLineRef.current = eraser
        addObject(eraser)
        setIsDrawing(true)
      } else if (tool === 'select') {
        // Check if clicked on an object
        const clickedOnEmpty = e.target === stage || e.target.attrs?.id === 'canvas-bg'
        if (clickedOnEmpty) {
          clearSelection()
          // Start rubber-band selection
          selectionStartRef.current = { x: pos.x, y: pos.y }
          setSelectionRect({
            x: pos.x,
            y: pos.y,
            width: 0,
            height: 0,
            visible: true,
          })
          setIsDrawing(true)
        } else {
          // Clicked on a shape — select it immediately so drag works
          const targetId = e.target.id()
          if (targetId) {
            const isMulti = e.evt.shiftKey
            if (isMulti) {
              if (selectedIds.includes(targetId)) {
                setSelectedIds(selectedIds.filter((id) => id !== targetId))
              } else {
                setSelectedIds([...selectedIds, targetId])
              }
            } else if (!selectedIds.includes(targetId)) {
              setSelectedIds([targetId])
            }
          }
        }
      }
    },
    [
      tool,
      brushConfig,
      eraserConfig,
      pushHistory,
      addObject,
      setIsDrawing,
      clearSelection,
      setSelectionRect,
    ],
  )

  const handleMouseMove = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      if (!isDrawing) return
      const stage = e.target.getStage()
      if (!stage) return
      const pos = stage.getRelativePointerPosition()
      if (!pos) return

      if ((tool === 'draw' || tool === 'eraser') && currentLineRef.current) {
        const obj = currentLineRef.current as LineObject | EraserObject
        const newPoints = [...obj.points, pos.x, pos.y]
        currentLineRef.current = { ...obj, points: newPoints }
        updateObject(obj.id, { points: newPoints })
      } else if (tool === 'select' && selectionStartRef.current) {
        const start = selectionStartRef.current
        setSelectionRect({
          x: Math.min(start.x, pos.x),
          y: Math.min(start.y, pos.y),
          width: Math.abs(pos.x - start.x),
          height: Math.abs(pos.y - start.y),
          visible: true,
        })
      }
    },
    [isDrawing, tool, updateObject, setSelectionRect],
  )

  const handleMouseUp = useCallback(() => {
    if (!isDrawing) return

    if (tool === 'select' && selectionStartRef.current) {
      // Finish rubber-band selection
      const rect = useEditorStore.getState().selectionRect
      if (rect && rect.width > 5 && rect.height > 5) {
        const objects = getActiveObjects()
        const ids = objects
          .filter((obj) => {
            if (obj.type === 'line' || obj.type === 'eraser') return false
            return (
              obj.x >= rect.x &&
              obj.x + (('width' in obj ? obj.width : 0) as number) <=
                rect.x + rect.width &&
              obj.y >= rect.y &&
              obj.y + (('height' in obj ? obj.height : 0) as number) <=
                rect.y + rect.height
            )
          })
          .map((obj) => obj.id)
        setSelectedIds(ids)
      }
      setSelectionRect(null)
      selectionStartRef.current = null
    }

    currentLineRef.current = null
    setIsDrawing(false)
  }, [isDrawing, tool, getActiveObjects, setSelectedIds, setSelectionRect, setIsDrawing])

  const handleObjectClick = useCallback(
    (e: KonvaEventObject<MouseEvent>, objectId: string) => {
      if (tool !== 'select') return
      e.cancelBubble = true

      const isMulti = e.evt.shiftKey
      if (isMulti) {
        const current = selectedIds
        if (current.includes(objectId)) {
          setSelectedIds(current.filter((id) => id !== objectId))
        } else {
          setSelectedIds([...current, objectId])
        }
      } else {
        setSelectedIds([objectId])
      }
    },
    [tool, selectedIds, setSelectedIds],
  )

  const handleTransformEnd = useCallback(
    (e: KonvaEventObject<Event>) => {
      const node = e.target as Konva.Node
      pushHistory()
      updateObject(node.id(), {
        x: node.x(),
        y: node.y(),
        rotation: node.rotation(),
        scaleX: node.scaleX(),
        scaleY: node.scaleY(),
      })
    },
    [pushHistory, updateObject],
  )

  const handleDragEnd = useCallback(
    (e: KonvaEventObject<DragEvent>) => {
      const node = e.target as Konva.Node
      pushHistory()
      updateObject(node.id(), {
        x: node.x(),
        y: node.y(),
      })
    },
    [pushHistory, updateObject],
  )

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleObjectClick,
    handleTransformEnd,
    handleDragEnd,
  }
}
