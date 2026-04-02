import Konva from 'konva'
import type { BrushConfig, BrushStyle } from '@/types'

export function getDashArray(style: BrushStyle, strokeWidth: number): number[] {
  switch (style) {
    case 'dashed':
      return [strokeWidth * 3, strokeWidth * 2]
    case 'dotted':
      return [strokeWidth, strokeWidth * 1.5]
    case 'solid':
    default:
      return []
  }
}

export function exportStageAsImage(
  stage: Konva.Stage,
  background: string,
  pixelRatio = 2,
): string {
  // Create a temporary layer for the background
  const bgLayer = new Konva.Layer()
  const bgRect = new Konva.Rect({
    x: 0,
    y: 0,
    width: stage.width(),
    height: stage.height(),
    fill: background,
  })
  bgLayer.add(bgRect)
  stage.add(bgLayer)
  bgLayer.moveToBottom()

  const dataURL = stage.toDataURL({ pixelRatio })

  bgLayer.destroy()
  return dataURL
}

export function downloadDataURL(dataURL: string, filename: string): void {
  const a = document.createElement('a')
  a.href = dataURL
  a.download = filename
  a.click()
}

export function createLineFromBrush(
  brush: BrushConfig,
  startX: number,
  startY: number,
) {
  return {
    stroke: brush.color,
    strokeWidth: brush.strokeWidth,
    opacity: brush.opacity,
    lineCap: brush.lineCap,
    lineJoin: brush.lineJoin,
    tension: brush.tension,
    dash: getDashArray(brush.style, brush.strokeWidth),
    globalCompositeOperation: 'source-over',
    points: [startX, startY],
  }
}
