import { useRef, useCallback } from 'react'
import {
  Undo2,
  Redo2,
  Copy,
  Trash2,
  Type,
  ImagePlus,
  Eraser,
  Download,
  FolderOpen,
  Save,
} from 'lucide-react'
import type Konva from 'konva'
import { v4 as uuid } from 'uuid'
import { useEditorStore } from '@/stores/editor-store'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import { exportStageAsImage, downloadDataURL } from '@/lib/canvas-utils'
import type { TextObject, ImageObject } from '@/types'

interface ActionBarProps {
  stageRef: React.RefObject<Konva.Stage | null>
}

export function ActionBar({ stageRef }: ActionBarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    selectedIds,
    pushHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    removeObjects,
    addObject,
    clearCanvas,
    getActiveFile,
    setTool,
    setFilePanelOpen,
    persist,
    getActiveObjects,
    setSelectedIds,
  } = useEditorStore()

  const handleUndo = useCallback(() => {
    if (canUndo()) undo()
  }, [canUndo, undo])

  const handleRedo = useCallback(() => {
    if (canRedo()) redo()
  }, [canRedo, redo])

  const handleCopy = useCallback(() => {
    if (selectedIds.length === 0) return
    const objects = getActiveObjects()
    const selected = objects.filter((o) => selectedIds.includes(o.id))
    pushHistory()
    const newIds: string[] = []
    for (const obj of selected) {
      const newObj = {
        ...structuredClone(obj),
        id: uuid(),
        x: obj.x + 20,
        y: obj.y + 20,
      }
      addObject(newObj)
      newIds.push(newObj.id)
    }
    setSelectedIds(newIds)
  }, [selectedIds, getActiveObjects, pushHistory, addObject, setSelectedIds])

  const handleDelete = useCallback(() => {
    if (selectedIds.length === 0) return
    pushHistory()
    removeObjects(selectedIds)
  }, [selectedIds, pushHistory, removeObjects])

  const handleAddText = useCallback(() => {
    pushHistory()
    const textObj: TextObject = {
      id: uuid(),
      type: 'text',
      x: 100,
      y: 100,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      visible: true,
      text: 'Double-click to edit',
      fontSize: 24,
      fontFamily: 'Inter, sans-serif',
      fill: '#e2e8f0',
      width: 250,
      height: 32,
    }
    addObject(textObj)
    setTool('select')
    setSelectedIds([textObj.id])
  }, [pushHistory, addObject, setTool, setSelectedIds])

  const handleUploadImage = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      if (!file.type.startsWith('image/')) return

      const reader = new FileReader()
      reader.onload = (ev) => {
        const src = ev.target?.result as string
        const img = new window.Image()
        img.onload = () => {
          pushHistory()
          const imgObj: ImageObject = {
            id: uuid(),
            type: 'image',
            x: 50,
            y: 50,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            visible: true,
            src,
            width: Math.min(img.width, 600),
            height: Math.min(img.height, 400),
          }
          addObject(imgObj)
          setTool('select')
          setSelectedIds([imgObj.id])
        }
        img.src = src
      }
      reader.readAsDataURL(file)
      // Reset so the same file can be uploaded again
      e.target.value = ''
    },
    [pushHistory, addObject, setTool, setSelectedIds],
  )

  const handleSaveImage = useCallback(() => {
    if (!stageRef.current) return
    const file = getActiveFile()
    const dataURL = exportStageAsImage(stageRef.current, file.background)
    downloadDataURL(dataURL, `${file.title || 'canvas'}.png`)
  }, [stageRef, getActiveFile])

  const handleClear = useCallback(() => {
    clearCanvas()
  }, [clearCanvas])

  const handleSave = useCallback(() => {
    persist()
  }, [persist])

  const hasSelection = selectedIds.length > 0

  return (
    <div className="flex items-center gap-1 rounded-xl border border-border/50 bg-card/80 px-2 py-1.5 shadow-lg backdrop-blur-xl">
      {/* Undo / Redo */}
      <ActionButton
        icon={Undo2}
        label="Undo"
        shortcut="Ctrl+Z"
        onClick={handleUndo}
        disabled={!canUndo()}
      />
      <ActionButton
        icon={Redo2}
        label="Redo"
        shortcut="Ctrl+Y"
        onClick={handleRedo}
        disabled={!canRedo()}
      />

      <Separator orientation="vertical" className="mx-1 h-5" />

      {/* Selection actions */}
      <ActionButton
        icon={Copy}
        label="Copy Selection"
        onClick={handleCopy}
        disabled={!hasSelection}
      />
      <ActionButton
        icon={Trash2}
        label="Delete Selection"
        shortcut="Del"
        onClick={handleDelete}
        disabled={!hasSelection}
      />

      <Separator orientation="vertical" className="mx-1 h-5" />

      {/* Add items */}
      <ActionButton icon={Type} label="Add Text" onClick={handleAddText} />
      <ActionButton
        icon={ImagePlus}
        label="Upload Image"
        onClick={handleUploadImage}
      />

      <Separator orientation="vertical" className="mx-1 h-5" />

      {/* Canvas actions */}
      <ActionButton icon={Eraser} label="Clear Canvas" onClick={handleClear} />
      <ActionButton
        icon={Download}
        label="Save as Image"
        onClick={handleSaveImage}
      />
      <ActionButton
        icon={Save}
        label="Save"
        shortcut="Ctrl+S"
        onClick={handleSave}
      />
      <ActionButton
        icon={FolderOpen}
        label="Files"
        onClick={() => setFilePanelOpen(true)}
      />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}

function ActionButton({
  icon: Icon,
  label,
  shortcut,
  onClick,
  disabled = false,
}: {
  icon: typeof Undo2
  label: string
  shortcut?: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClick}
          disabled={disabled}
          aria-label={label}
        >
          <Icon />
        </Button>
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        className="flex items-center gap-2"
      >
        {label}
        {shortcut && (
          <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            {shortcut}
          </kbd>
        )}
      </TooltipContent>
    </Tooltip>
  )
}
