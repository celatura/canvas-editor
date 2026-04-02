// ─── Tool Modes ───────────────────────────────────────────────
export type ToolMode = 'draw' | 'eraser' | 'select' | 'text'

// ─── Brush Styles ─────────────────────────────────────────────
export type BrushStyle = 'solid' | 'dashed' | 'dotted'

export interface BrushConfig {
  color: string
  strokeWidth: number
  opacity: number
  style: BrushStyle
  lineCap: 'butt' | 'round' | 'square'
  lineJoin: 'bevel' | 'miter' | 'round'
  tension: number
}

// ─── Eraser Config ────────────────────────────────────────────
export interface EraserConfig {
  strokeWidth: number
}

// ─── Canvas Objects ───────────────────────────────────────────
export type CanvasObjectType = 'line' | 'eraser' | 'text' | 'image'

export interface BaseObject {
  id: string
  type: CanvasObjectType
  x: number
  y: number
  rotation: number
  scaleX: number
  scaleY: number
  visible: boolean
}

export interface LineObject extends BaseObject {
  type: 'line'
  points: number[]
  stroke: string
  strokeWidth: number
  opacity: number
  lineCap: 'butt' | 'round' | 'square'
  lineJoin: 'bevel' | 'miter' | 'round'
  tension: number
  dash: number[]
  globalCompositeOperation: string
}

export interface EraserObject extends BaseObject {
  type: 'eraser'
  points: number[]
  strokeWidth: number
}

export interface TextObject extends BaseObject {
  type: 'text'
  text: string
  fontSize: number
  fontFamily: string
  fill: string
  width: number
  height: number
}

export interface ImageObject extends BaseObject {
  type: 'image'
  src: string
  width: number
  height: number
}

export type CanvasObject = LineObject | EraserObject | TextObject | ImageObject

// ─── Canvas / File ────────────────────────────────────────────
export interface CanvasFile {
  id: string
  title: string
  objects: CanvasObject[]
  width: number
  height: number
  background: string
  createdAt: number
  updatedAt: number
}

// ─── History ──────────────────────────────────────────────────
export interface HistoryEntry {
  objects: CanvasObject[]
}

// ─── Selection ────────────────────────────────────────────────
export interface SelectionRect {
  x: number
  y: number
  width: number
  height: number
  visible: boolean
}
