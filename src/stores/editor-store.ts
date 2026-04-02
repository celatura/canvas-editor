import { create } from 'zustand'
import { v4 as uuid } from 'uuid'
import type {
  ToolMode,
  BrushConfig,
  EraserConfig,
  CanvasObject,
  CanvasFile,
  FileHistory,
  SelectionRect,
} from '@/types'
import {
  DEFAULT_BRUSH_CONFIG,
  DEFAULT_ERASER_CONFIG,
  DEFAULT_CANVAS_CONFIG,
} from '@/types'
import {
  saveFiles,
  loadFiles,
  saveActiveFileId,
  loadActiveFileId,
} from '@/lib/persistence'

const MAX_HISTORY = 50

function createDefaultFile(): CanvasFile {
  return {
    id: uuid(),
    title: 'Untitled',
    objects: [],
    width: DEFAULT_CANVAS_CONFIG.width,
    height: DEFAULT_CANVAS_CONFIG.height,
    background: DEFAULT_CANVAS_CONFIG.background,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}

// ─── Store Interface ──────────────────────────────────────────
interface EditorState {
  // Tool
  tool: ToolMode
  brushConfig: BrushConfig
  eraserConfig: EraserConfig

  // Files
  files: CanvasFile[]
  activeFileId: string

  // Selection
  selectedIds: string[]
  selectionRect: SelectionRect | null

  // Drawing state
  isDrawing: boolean

  // History (per file)
  histories: Record<string, FileHistory>

  // File panel
  filePanelOpen: boolean
}

interface EditorActions {
  // Tool actions
  setTool: (tool: ToolMode) => void
  setBrushConfig: (config: Partial<BrushConfig>) => void
  setEraserConfig: (config: Partial<EraserConfig>) => void

  // Drawing state
  setIsDrawing: (v: boolean) => void

  // Object actions
  addObject: (obj: CanvasObject) => void
  updateObject: (id: string, partial: Partial<CanvasObject>) => void
  removeObjects: (ids: string[]) => void
  setObjects: (objects: CanvasObject[]) => void

  // Selection
  setSelectedIds: (ids: string[]) => void
  clearSelection: () => void
  setSelectionRect: (rect: SelectionRect | null) => void

  // History
  pushHistory: () => void
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean

  // File management
  addFile: () => string
  removeFile: (id: string) => void
  setActiveFile: (id: string) => void
  updateFileTitle: (id: string, title: string) => void
  duplicateFile: (id: string) => void
  reorderFiles: (fromIndex: number, toIndex: number) => void
  importFile: (file: CanvasFile) => void

  // Canvas config
  setCanvasSize: (width: number, height: number) => void
  setCanvasBackground: (bg: string) => void

  // Clear
  clearCanvas: () => void

  // Persistence
  persist: () => void
  hydrate: () => void

  // File panel
  setFilePanelOpen: (open: boolean) => void

  // Helpers
  getActiveFile: () => CanvasFile
  getActiveObjects: () => CanvasObject[]
}

export type EditorStore = EditorState & EditorActions

// ─── Initial state ────────────────────────────────────────────
const defaultFile = createDefaultFile()

export const useEditorStore = create<EditorStore>((set, get) => ({
  // ── State ─────────────────────────────────────────────────
  tool: 'draw',
  brushConfig: { ...DEFAULT_BRUSH_CONFIG },
  eraserConfig: { ...DEFAULT_ERASER_CONFIG },
  files: [defaultFile],
  activeFileId: defaultFile.id,
  selectedIds: [],
  selectionRect: null,
  isDrawing: false,
  histories: { [defaultFile.id]: { past: [], future: [] } },
  filePanelOpen: false,

  // ── Tool ──────────────────────────────────────────────────
  setTool: (tool) => set({ tool, selectedIds: [], selectionRect: null }),
  setBrushConfig: (config) =>
    set((s) => ({ brushConfig: { ...s.brushConfig, ...config } })),
  setEraserConfig: (config) =>
    set((s) => ({ eraserConfig: { ...s.eraserConfig, ...config } })),

  // ── Drawing ───────────────────────────────────────────────
  setIsDrawing: (v) => set({ isDrawing: v }),

  // ── Objects ───────────────────────────────────────────────
  addObject: (obj) => {
    const state = get()
    const file = state.files.find((f) => f.id === state.activeFileId)
    if (!file) return
    const updatedFile = {
      ...file,
      objects: [...file.objects, obj],
      updatedAt: Date.now(),
    }
    set({
      files: state.files.map((f) =>
        f.id === state.activeFileId ? updatedFile : f,
      ),
    })
  },

  updateObject: (id, partial) => {
    const state = get()
    const file = state.files.find((f) => f.id === state.activeFileId)
    if (!file) return
    const updatedFile = {
      ...file,
      objects: file.objects.map((o) =>
        o.id === id ? ({ ...o, ...partial } as CanvasObject) : o,
      ),
      updatedAt: Date.now(),
    }
    set({
      files: state.files.map((f) =>
        f.id === state.activeFileId ? updatedFile : f,
      ),
    })
  },

  removeObjects: (ids) => {
    const state = get()
    const idSet = new Set(ids)
    const file = state.files.find((f) => f.id === state.activeFileId)
    if (!file) return
    const updatedFile = {
      ...file,
      objects: file.objects.filter((o) => !idSet.has(o.id)),
      updatedAt: Date.now(),
    }
    set({
      files: state.files.map((f) =>
        f.id === state.activeFileId ? updatedFile : f,
      ),
      selectedIds: state.selectedIds.filter((sid) => !idSet.has(sid)),
    })
  },

  setObjects: (objects) => {
    const state = get()
    set({
      files: state.files.map((f) =>
        f.id === state.activeFileId
          ? { ...f, objects, updatedAt: Date.now() }
          : f,
      ),
    })
  },

  // ── Selection ─────────────────────────────────────────────
  setSelectedIds: (ids) => set({ selectedIds: ids }),
  clearSelection: () => set({ selectedIds: [], selectionRect: null }),
  setSelectionRect: (rect) => set({ selectionRect: rect }),

  // ── History ───────────────────────────────────────────────
  pushHistory: () => {
    const state = get()
    const file = state.files.find((f) => f.id === state.activeFileId)
    if (!file) return
    const history = state.histories[state.activeFileId] ?? {
      past: [],
      future: [],
    }
    const past = [
      ...history.past.slice(-(MAX_HISTORY - 1)),
      { objects: structuredClone(file.objects) },
    ]
    set({
      histories: {
        ...state.histories,
        [state.activeFileId]: { past, future: [] },
      },
    })
  },

  undo: () => {
    const state = get()
    const history = state.histories[state.activeFileId]
    if (!history || history.past.length === 0) return
    const file = state.files.find((f) => f.id === state.activeFileId)
    if (!file) return

    const past = [...history.past]
    const entry = past.pop()!
    const future = [{ objects: structuredClone(file.objects) }, ...history.future]

    set({
      files: state.files.map((f) =>
        f.id === state.activeFileId
          ? { ...f, objects: entry.objects, updatedAt: Date.now() }
          : f,
      ),
      histories: {
        ...state.histories,
        [state.activeFileId]: { past, future },
      },
      selectedIds: [],
      selectionRect: null,
    })
  },

  redo: () => {
    const state = get()
    const history = state.histories[state.activeFileId]
    if (!history || history.future.length === 0) return
    const file = state.files.find((f) => f.id === state.activeFileId)
    if (!file) return

    const future = [...history.future]
    const entry = future.shift()!
    const past = [...history.past, { objects: structuredClone(file.objects) }]

    set({
      files: state.files.map((f) =>
        f.id === state.activeFileId
          ? { ...f, objects: entry.objects, updatedAt: Date.now() }
          : f,
      ),
      histories: {
        ...state.histories,
        [state.activeFileId]: { past, future },
      },
      selectedIds: [],
      selectionRect: null,
    })
  },

  canUndo: () => {
    const state = get()
    const h = state.histories[state.activeFileId]
    return !!h && h.past.length > 0
  },

  canRedo: () => {
    const state = get()
    const h = state.histories[state.activeFileId]
    return !!h && h.future.length > 0
  },

  // ── File Management ───────────────────────────────────────
  addFile: () => {
    const file = createDefaultFile()
    const state = get()
    set({
      files: [...state.files, file],
      activeFileId: file.id,
      selectedIds: [],
      selectionRect: null,
      histories: {
        ...state.histories,
        [file.id]: { past: [], future: [] },
      },
    })
    return file.id
  },

  removeFile: (id) => {
    const state = get()
    if (state.files.length <= 1) return
    const files = state.files.filter((f) => f.id !== id)
    const newHistories = { ...state.histories }
    delete newHistories[id]
    const newActiveId =
      state.activeFileId === id ? files[0].id : state.activeFileId
    set({
      files,
      activeFileId: newActiveId,
      histories: newHistories,
      selectedIds: [],
      selectionRect: null,
    })
  },

  setActiveFile: (id) => {
    set({ activeFileId: id, selectedIds: [], selectionRect: null })
  },

  updateFileTitle: (id, title) => {
    set((s) => ({
      files: s.files.map((f) =>
        f.id === id ? { ...f, title, updatedAt: Date.now() } : f,
      ),
    }))
  },

  duplicateFile: (id) => {
    const state = get()
    const file = state.files.find((f) => f.id === id)
    if (!file) return
    const newFile: CanvasFile = {
      ...structuredClone(file),
      id: uuid(),
      title: `${file.title} (copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    set({
      files: [...state.files, newFile],
      activeFileId: newFile.id,
      histories: {
        ...state.histories,
        [newFile.id]: { past: [], future: [] },
      },
      selectedIds: [],
      selectionRect: null,
    })
  },

  reorderFiles: (fromIndex, toIndex) => {
    set((s) => {
      const files = [...s.files]
      const [moved] = files.splice(fromIndex, 1)
      files.splice(toIndex, 0, moved)
      return { files }
    })
  },

  importFile: (file) => {
    const newFile = { ...file, id: uuid(), updatedAt: Date.now() }
    const state = get()
    set({
      files: [...state.files, newFile],
      activeFileId: newFile.id,
      histories: {
        ...state.histories,
        [newFile.id]: { past: [], future: [] },
      },
      selectedIds: [],
      selectionRect: null,
    })
  },

  // ── Canvas Config ─────────────────────────────────────────
  setCanvasSize: (width, height) => {
    set((s) => ({
      files: s.files.map((f) =>
        f.id === s.activeFileId ? { ...f, width, height, updatedAt: Date.now() } : f,
      ),
    }))
  },

  setCanvasBackground: (bg) => {
    set((s) => ({
      files: s.files.map((f) =>
        f.id === s.activeFileId
          ? { ...f, background: bg, updatedAt: Date.now() }
          : f,
      ),
    }))
  },

  // ── Clear ─────────────────────────────────────────────────
  clearCanvas: () => {
    const state = get()
    state.pushHistory()
    set({
      files: state.files.map((f) =>
        f.id === state.activeFileId
          ? { ...f, objects: [], updatedAt: Date.now() }
          : f,
      ),
      selectedIds: [],
      selectionRect: null,
    })
  },

  // ── Persistence ───────────────────────────────────────────
  persist: () => {
    const state = get()
    saveFiles(state.files)
    saveActiveFileId(state.activeFileId)
  },

  hydrate: () => {
    const files = loadFiles()
    const activeId = loadActiveFileId()
    if (files && files.length > 0) {
      const histories: Record<string, FileHistory> = {}
      for (const f of files) {
        histories[f.id] = { past: [], future: [] }
      }
      const resolvedActive =
        activeId && files.some((f) => f.id === activeId)
          ? activeId
          : files[0].id
      set({ files, activeFileId: resolvedActive, histories })
    }
  },

  // ── File Panel ────────────────────────────────────────────
  setFilePanelOpen: (open) => set({ filePanelOpen: open }),

  // ── Helpers ───────────────────────────────────────────────
  getActiveFile: () => {
    const state = get()
    return state.files.find((f) => f.id === state.activeFileId)!
  },

  getActiveObjects: () => {
    const state = get()
    const file = state.files.find((f) => f.id === state.activeFileId)
    return file?.objects ?? []
  },
}))
