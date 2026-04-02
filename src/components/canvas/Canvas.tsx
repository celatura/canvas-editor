import { useRef, useCallback } from 'react'
import { Stage, Layer, Rect } from 'react-konva'
import type Konva from 'konva'
import { useEditorStore } from '@/stores/editor-store'
import { useCanvasEvents } from '@/hooks/use-canvas-events'
import { LineRenderer, EraserRenderer } from './LineRenderer'
import { TextRenderer } from './TextRenderer'
import { ImageRenderer } from './ImageRenderer'
import { SelectionTransformer } from './SelectionTransformer'
import { SelectionOverlay } from './SelectionOverlay'

interface CanvasProps {
  stageRef: React.RefObject<Konva.Stage | null>
}

export function Canvas({ stageRef }: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const activeFile = useEditorStore((s) =>
    s.files.find((f) => f.id === s.activeFileId),
  )
  const tool = useEditorStore((s) => s.tool)
  const selectedIds = useEditorStore((s) => s.selectedIds)
  const updateObject = useEditorStore((s) => s.updateObject)
  const pushHistory = useEditorStore((s) => s.pushHistory)

  const {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleObjectClick,
    handleTransformEnd,
    handleDragEnd,
  } = useCanvasEvents()

  const handleTextChange = useCallback(
    (id: string, text: string) => {
      pushHistory()
      updateObject(id, { text })
    },
    [pushHistory, updateObject],
  )

  if (!activeFile) return null

  const objects = activeFile.objects
  const cursor =
    tool === 'draw'
      ? 'crosshair'
      : tool === 'eraser'
        ? 'crosshair'
        : tool === 'text'
          ? 'text'
          : 'default'

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-hidden"
      style={{ cursor }}
    >
      <Stage
        ref={stageRef}
        width={activeFile.width}
        height={activeFile.height}
        onMouseDown={handleMouseDown}
        onMousemove={handleMouseMove}
        onMouseup={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
        style={{
          backgroundColor: activeFile.background,
        }}
      >
        <Layer>
          {/* Background */}
          <Rect
            id="canvas-bg"
            x={0}
            y={0}
            width={activeFile.width}
            height={activeFile.height}
            fill={activeFile.background}
            listening={true}
          />

          {/* Render objects */}
          {objects.map((obj) => {
            switch (obj.type) {
              case 'line':
                return (
                  <LineRenderer
                    key={obj.id}
                    line={obj}
                    onSelect={(id) =>
                      handleObjectClick(
                        { cancelBubble: false, evt: { shiftKey: false } } as never,
                        id,
                      )
                    }
                  />
                )
              case 'eraser':
                return <EraserRenderer key={obj.id} eraser={obj} />
              case 'text':
                return (
                  <TextRenderer
                    key={obj.id}
                    obj={obj}
                    isSelected={selectedIds.includes(obj.id)}
                    onSelect={(id) =>
                      handleObjectClick(
                        { cancelBubble: false, evt: { shiftKey: false } } as never,
                        id,
                      )
                    }
                    onTransformEnd={handleTransformEnd}
                    onDragEnd={handleDragEnd}
                    onTextChange={handleTextChange}
                  />
                )
              case 'image':
                return (
                  <ImageRenderer
                    key={obj.id}
                    obj={obj}
                    isSelected={selectedIds.includes(obj.id)}
                    onSelect={(id) =>
                      handleObjectClick(
                        { cancelBubble: false, evt: { shiftKey: false } } as never,
                        id,
                      )
                    }
                    onTransformEnd={handleTransformEnd}
                    onDragEnd={handleDragEnd}
                  />
                )
              default:
                return null
            }
          })}

          {/* Selection overlay (rubber-band) */}
          <SelectionOverlay />

          {/* Transformer for selected objects */}
          <SelectionTransformer />
        </Layer>
      </Stage>
    </div>
  )
}
