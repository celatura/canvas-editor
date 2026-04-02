import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Settings } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useEditorStore } from '@/stores/editor-store'

const BACKGROUND_PRESETS = [
  { label: 'Slate', value: '#0f172a' },
  { label: 'Zinc', value: '#18181b' },
  { label: 'Stone', value: '#1c1917' },
  { label: 'White', value: '#ffffff' },
  { label: 'Emerald', value: '#022c22' },
  { label: 'Blue', value: '#0c1b37' },
]

const SIZE_PRESETS = [
  { label: 'HD', w: 1280, h: 720 },
  { label: 'Full HD', w: 1920, h: 1080 },
  { label: '2K', w: 2560, h: 1440 },
  { label: 'Square', w: 1080, h: 1080 },
  { label: 'A4', w: 2480, h: 3508 },
]

export function CanvasSettingsPanel() {
  const activeFile = useEditorStore((s) =>
    s.files.find((f) => f.id === s.activeFileId),
  )
  const setCanvasSize = useEditorStore((s) => s.setCanvasSize)
  const setCanvasBackground = useEditorStore((s) => s.setCanvasBackground)

  if (!activeFile) return null

  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-9"
              aria-label="Canvas Settings"
            >
              <Settings className="size-[18px]" />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="right">Canvas Settings</TooltipContent>
      </Tooltip>

      <PopoverContent side="right" align="end" className="w-64 space-y-4">
        {/* Background */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Background</Label>
          <div className="flex flex-wrap gap-1.5">
            {BACKGROUND_PRESETS.map((bg) => (
              <button
                key={bg.value}
                className="flex size-7 items-center justify-center rounded-md border border-border/50 transition-all hover:scale-110"
                style={{ backgroundColor: bg.value }}
                onClick={() => setCanvasBackground(bg.value)}
                aria-label={bg.label}
              >
                {activeFile.background === bg.value && (
                  <span className="size-2 rounded-full bg-primary" />
                )}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 pt-1">
            <Label className="text-xs text-muted-foreground">Custom</Label>
            <input
              type="color"
              value={activeFile.background}
              onChange={(e) => setCanvasBackground(e.target.value)}
              className="size-7 cursor-pointer rounded border-0 bg-transparent p-0"
            />
          </div>
        </div>

        <Separator />

        {/* Size */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Canvas Size</Label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label className="text-[10px] text-muted-foreground">Width</Label>
              <Input
                type="number"
                value={activeFile.width}
                onChange={(e) =>
                  setCanvasSize(
                    Math.max(100, parseInt(e.target.value) || 100),
                    activeFile.height,
                  )
                }
                className="h-7 text-xs"
              />
            </div>
            <div className="flex-1">
              <Label className="text-[10px] text-muted-foreground">Height</Label>
              <Input
                type="number"
                value={activeFile.height}
                onChange={(e) =>
                  setCanvasSize(
                    activeFile.width,
                    Math.max(100, parseInt(e.target.value) || 100),
                  )
                }
                className="h-7 text-xs"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-1">
            {SIZE_PRESETS.map((preset) => (
              <Button
                key={preset.label}
                variant={
                  activeFile.width === preset.w && activeFile.height === preset.h
                    ? 'secondary'
                    : 'ghost'
                }
                size="xs"
                className="text-[10px]"
                onClick={() => setCanvasSize(preset.w, preset.h)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
