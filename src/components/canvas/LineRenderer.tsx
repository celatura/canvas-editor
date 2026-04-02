import { Line } from 'react-konva'
import type { LineObject, EraserObject } from '@/types'

interface LineRendererProps {
  line: LineObject
  onSelect?: (id: string) => void
}

export function LineRenderer({ line, onSelect }: LineRendererProps) {
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
      onClick={() => onSelect?.(line.id)}
      onTap={() => onSelect?.(line.id)}
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
