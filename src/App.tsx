import { useRef } from 'react'
import type Konva from 'konva'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Canvas } from '@/components/canvas/Canvas'
import { Toolbar } from '@/components/toolbar/Toolbar'
import { ActionBar } from '@/components/toolbar/ActionBar'
import { BrushPanel } from '@/components/toolbar/BrushPanel'
import { EraserPanel } from '@/components/toolbar/EraserPanel'
import { CanvasSettingsPanel } from '@/components/toolbar/CanvasSettingsPanel'
import { FilePanel } from '@/components/panels/FilePanel'
import { useEditorStore } from '@/stores/editor-store'
import { usePersistence } from '@/hooks/use-persistence'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'

function App() {
  const stageRef = useRef<Konva.Stage>(null)
  const activeFile = useEditorStore((s) =>
    s.files.find((f) => f.id === s.activeFileId),
  )

  usePersistence()
  useKeyboardShortcuts()

  return (
    <TooltipProvider delayDuration={200}>
      <div className="relative flex h-svh w-full select-none overflow-hidden bg-background">
        {/* Canvas area */}
        <div className="relative flex-1 overflow-auto">
          <Canvas stageRef={stageRef} />

          {/* Top action bar - floating */}
          <div className="absolute left-1/2 top-3 z-10 -translate-x-1/2">
            <ActionBar stageRef={stageRef} />
          </div>

          {/* Left toolbar - floating */}
          <div className="absolute left-3 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-2">
            <Toolbar />
            <BrushPanel />
            <EraserPanel />
            <CanvasSettingsPanel />
          </div>

          {/* Bottom status bar */}
          <div className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2">
            <div className="flex items-center gap-3 rounded-lg border border-border/30 bg-card/60 px-3 py-1 text-[11px] text-muted-foreground backdrop-blur-lg">
              <span>
                {activeFile?.width} × {activeFile?.height}
              </span>
              <span className="size-1 rounded-full bg-muted-foreground/30" />
              <span>{activeFile?.objects.length ?? 0} objects</span>
              <span className="size-1 rounded-full bg-muted-foreground/30" />
              <span className="max-w-32 truncate">{activeFile?.title}</span>
            </div>
          </div>
        </div>

        {/* File panel (sheet) */}
        <FilePanel />
      </div>
    </TooltipProvider>
  )
}

export default App
