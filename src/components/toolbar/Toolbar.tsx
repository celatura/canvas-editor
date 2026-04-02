import {
  Pen,
  Eraser,
  MousePointer2,
  Type,
} from 'lucide-react'
import { useEditorStore } from '@/stores/editor-store'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { ToolMode } from '@/types'

const tools: { mode: ToolMode; icon: typeof Pen; label: string; shortcut: string }[] = [
  { mode: 'select', icon: MousePointer2, label: 'Select', shortcut: 'V' },
  { mode: 'draw', icon: Pen, label: 'Draw', shortcut: 'B' },
  { mode: 'eraser', icon: Eraser, label: 'Eraser', shortcut: 'E' },
  { mode: 'text', icon: Type, label: 'Text', shortcut: 'T' },
]

export function Toolbar() {
  const tool = useEditorStore((s) => s.tool)
  const setTool = useEditorStore((s) => s.setTool)

  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border/50 bg-card/80 p-1.5 shadow-lg backdrop-blur-xl">
      {tools.map((t) => {
        const Icon = t.icon
        const isActive = tool === t.mode
        return (
          <Tooltip key={t.mode}>
            <TooltipTrigger asChild>
              <Button
                variant={isActive ? 'secondary' : 'ghost'}
                size="icon"
                className={cn(
                  'relative size-9 transition-all',
                  isActive && 'bg-primary/15 text-primary shadow-sm',
                )}
                onClick={() => setTool(t.mode)}
                aria-label={t.label}
              >
                <Icon className="size-[18px]" />
                {isActive && (
                  <span className="absolute -right-0.5 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-primary" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="flex items-center gap-2">
              {t.label}
              <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                {t.shortcut}
              </kbd>
            </TooltipContent>
          </Tooltip>
        )
      })}
    </div>
  )
}
