import { Line } from 'react-konva'
import type { LineObject, EraserObject } from '@/types'

interface LineRendererProps {
  line: LineObject
  draggable?: boolean
  onSelect?: (id: string) => void
  onDragEnd?: (e: import('konva/lib/Node').KonvaEventObject<DragEvent>) => void
}

export function LineRenderer({ line, draggable = false, onSelect, onDragEnd }: LineRendererProps) {
  return (
    <Line
      id={line.id}
      points={line.points}
      stroke={line.stroke}
      strokeWidth={line.strokeWidth}
      opacity={line.opacity}
      lineCap={line.lineCap}
      lineJoin={line.lineJoin}
      tension={line.tension}
      dash={line.dash}
      globalCompositeOperation={
        line.globalCompositeOperation as GlobalCompositeOperation
      }
      x={line.x}
      y={line.y}
      rotation={line.rotation}
      scaleX={line.scaleX}
      scaleY={line.scaleY}
      visible={line.visible}
      draggable={draggable}
      onClick={() => onSelect?.(line.id)}
      onTap={() => onSelect?.(line.id)}
      onDragEnd={onDragEnd}
      hitStrokeWidth={Math.max(line.strokeWidth, 20)}
    />
  )
}

interface EraserRendererProps {
  eraser: EraserObject
}

export function EraserRenderer({ eraser }: EraserRendererProps) {
  return (
    <Line
      id={eraser.id}
      points={eraser.points}
      stroke="#0f172a"
      strokeWidth={eraser.strokeWidth}
      lineCap="round"
      lineJoin="round"
      tension={0}
      globalCompositeOperation="destination-out"
      x={eraser.x}
      y={eraser.y}
      rotation={eraser.rotation}
      scaleX={eraser.scaleX}
      scaleY={eraser.scaleY}
      visible={eraser.visible}
      listening={false}
    />
  )
}
