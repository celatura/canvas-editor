import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Paintbrush } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useEditorStore } from '@/stores/editor-store'
import { cn } from '@/lib/utils'
import type { BrushStyle } from '@/types'

const PRESET_COLORS = [
  '#e2e8f0', '#94a3b8', '#f87171', '#fb923c',
  '#facc15', '#4ade80', '#22d3ee', '#60a5fa',
  '#a78bfa', '#f472b6', '#ffffff', '#000000',
]

const BRUSH_STYLES: { value: BrushStyle; label: string }[] = [
  { value: 'solid', label: 'Solid' },
  { value: 'dashed', label: 'Dashed' },
  { value: 'dotted', label: 'Dotted' },
]

export function BrushPanel() {
  const brushConfig = useEditorStore((s) => s.brushConfig)
  const setBrushConfig = useEditorStore((s) => s.setBrushConfig)
  const tool = useEditorStore((s) => s.tool)

  if (tool !== 'draw') return null

  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative size-9"
              aria-label="Brush Settings"
            >
              <Paintbrush className="size-[18px]" />
              <span
                className="absolute bottom-1 right-1 size-2.5 rounded-full border border-border"
                style={{ backgroundColor: brushConfig.color }}
              />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="right">Brush Settings</TooltipContent>
      </Tooltip>

      <PopoverContent
        side="right"
        align="start"
        className="w-64 space-y-4"
      >
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Color</Label>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                className={cn(
                  'size-6 rounded-md border-2 transition-all hover:scale-110',
                  brushConfig.color === color
                    ? 'border-primary shadow-md'
                    : 'border-transparent',
                )}
                style={{ backgroundColor: color }}
                onClick={() => setBrushConfig({ color })}
                aria-label={`Color ${color}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 pt-1">
            <Label className="text-xs text-muted-foreground">Custom</Label>
            <input
              type="color"
              value={brushConfig.color}
              onChange={(e) => setBrushConfig({ color: e.target.value })}
              className="size-7 cursor-pointer rounded border-0 bg-transparent p-0"
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Size</Label>
            <span className="font-mono text-xs text-muted-foreground">
              {brushConfig.strokeWidth}px
            </span>
          </div>
          <Slider
            value={[brushConfig.strokeWidth]}
            onValueChange={([v]) => setBrushConfig({ strokeWidth: v })}
            min={1}
            max={50}
            step={1}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Opacity</Label>
            <span className="font-mono text-xs text-muted-foreground">
              {Math.round(brushConfig.opacity * 100)}%
            </span>
          </div>
          <Slider
            value={[brushConfig.opacity]}
            onValueChange={([v]) => setBrushConfig({ opacity: v })}
            min={0.05}
            max={1}
            step={0.05}
          />
        </div>

        <Separator />

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Style</Label>
          <div className="flex gap-1">
            {BRUSH_STYLES.map((s) => (
              <Button
                key={s.value}
                variant={brushConfig.style === s.value ? 'secondary' : 'ghost'}
                size="sm"
                className="flex-1 text-xs"
                onClick={() => setBrushConfig({ style: s.value })}
              >
                {s.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Smoothing</Label>
            <span className="font-mono text-xs text-muted-foreground">
              {brushConfig.tension.toFixed(1)}
            </span>
          </div>
          <Slider
            value={[brushConfig.tension]}
            onValueChange={([v]) => setBrushConfig({ tension: v })}
            min={0}
            max={1}
            step={0.1}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
