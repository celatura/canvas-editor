import type { CanvasFile } from '@/types'

const STORAGE_KEY = 'canvas-editor-files'
const ACTIVE_FILE_KEY = 'canvas-editor-active-file'

export function saveFiles(files: CanvasFile[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(files))
  } catch {
    console.warn('Failed to save files to localStorage')
  }
}

export function loadFiles(): CanvasFile[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as CanvasFile[]
  } catch {
    return null
  }
}

export function saveActiveFileId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_FILE_KEY, id)
  } catch {
    // ignore
  }
}

export function loadActiveFileId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_FILE_KEY)
  } catch {
    return null
  }
}

export function exportFileAsJSON(file: CanvasFile): void {
  const blob = new Blob([JSON.stringify(file, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${file.title || 'canvas'}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function importFileFromJSON(jsonStr: string): CanvasFile | null {
  try {
    const parsed = JSON.parse(jsonStr) as CanvasFile
    if (!parsed.id || !Array.isArray(parsed.objects)) return null
    return parsed
  } catch {
    return null
  }
}
