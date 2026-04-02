import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Settings2 } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useEditorStore } from '@/stores/editor-store'

export function EraserPanel() {
  const eraserConfig = useEditorStore((s) => s.eraserConfig)
  const setEraserConfig = useEditorStore((s) => s.setEraserConfig)
  const tool = useEditorStore((s) => s.tool)

  if (tool !== 'eraser') return null

  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-9"
              aria-label="Eraser Settings"
            >
              <Settings2 className="size-[18px]" />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="right">Eraser Settings</TooltipContent>
      </Tooltip>

      <PopoverContent
        side="right"
        align="start"
        className="w-56 space-y-4"
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Size</Label>
            <span className="font-mono text-xs text-muted-foreground">
              {eraserConfig.strokeWidth}px
            </span>
          </div>
          <Slider
            value={[eraserConfig.strokeWidth]}
            onValueChange={([v]) => setEraserConfig({ strokeWidth: v })}
            min={5}
            max={100}
            step={1}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
