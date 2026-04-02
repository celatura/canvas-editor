import { useRef, useCallback } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Plus,
  MoreHorizontal,
  Trash2,
  Copy,
  Download,
  Upload,
  FileText,
} from 'lucide-react'
import { useEditorStore } from '@/stores/editor-store'
import { exportFileAsJSON, importFileFromJSON } from '@/lib/persistence'
import { cn } from '@/lib/utils'

export function FilePanel() {
  const importInputRef = useRef<HTMLInputElement>(null)

  const files = useEditorStore((s) => s.files)
  const activeFileId = useEditorStore((s) => s.activeFileId)
  const filePanelOpen = useEditorStore((s) => s.filePanelOpen)
  const setFilePanelOpen = useEditorStore((s) => s.setFilePanelOpen)
  const setActiveFile = useEditorStore((s) => s.setActiveFile)
  const addFile = useEditorStore((s) => s.addFile)
  const removeFile = useEditorStore((s) => s.removeFile)
  const updateFileTitle = useEditorStore((s) => s.updateFileTitle)
  const duplicateFile = useEditorStore((s) => s.duplicateFile)
  const importFile = useEditorStore((s) => s.importFile)

  const handleExport = useCallback(
    (id: string) => {
      const file = files.find((f) => f.id === id)
      if (file) exportFileAsJSON(file)
    },
    [files],
  )

  const handleImport = useCallback(() => {
    importInputRef.current?.click()
  }, [])

  const handleImportChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        const content = ev.target?.result as string
        const parsed = importFileFromJSON(content)
        if (parsed) {
          importFile(parsed)
        }
      }
      reader.readAsText(file)
      e.target.value = ''
    },
    [importFile],
  )

  return (
    <Sheet open={filePanelOpen} onOpenChange={setFilePanelOpen}>
      <SheetContent className="flex w-80 flex-col gap-0 p-0">
        <SheetHeader className="border-b border-border/50 px-4 py-3">
          <SheetTitle className="flex items-center gap-2 text-sm">
            <FileText className="size-4" />
            Files
          </SheetTitle>
        </SheetHeader>

        <div className="flex items-center gap-2 border-b border-border/50 px-4 py-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={() => addFile()}
          >
            <Plus data-icon="inline-start" />
            New Canvas
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={handleImport}
          >
            <Upload data-icon="inline-start" />
            Import
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-1 p-2">
            {files.map((file, index) => {
              const isActive = file.id === activeFileId
              return (
                <div
                  key={file.id}
                  className={cn(
                    'group flex items-center gap-2 rounded-lg px-3 py-2 transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-muted/50',
                  )}
                >
                  <button
                    className="flex flex-1 items-center gap-2 text-left"
                    onClick={() => setActiveFile(file.id)}
                  >
                    <span
                      className={cn(
                        'flex size-6 shrink-0 items-center justify-center rounded-md font-mono text-[10px]',
                        isActive
                          ? 'bg-primary/20 text-primary'
                          : 'bg-muted text-muted-foreground',
                      )}
                    >
                      {index + 1}
                    </span>
                    <Input
                      value={file.title}
                      onChange={(e) =>
                        updateFileTitle(file.id, e.target.value)
                      }
                      onClick={(e) => e.stopPropagation()}
                      className="h-auto border-none bg-transparent p-0 text-xs shadow-none focus-visible:ring-0"
                    />
                  </button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <MoreHorizontal />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuGroup>
                        <DropdownMenuItem
                          onClick={() => duplicateFile(file.id)}
                        >
                          <Copy />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleExport(file.id)}
                        >
                          <Download />
                          Export JSON
                        </DropdownMenuItem>
                        {files.length > 1 && (
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => removeFile(file.id)}
                          >
                            <Trash2 />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )
            })}
          </div>
        </ScrollArea>

        <div className="border-t border-border/50 px-4 py-2 text-[10px] text-muted-foreground">
          {files.length} canvas{files.length !== 1 ? 'es' : ''} · Auto-saved
        </div>

        <input
          ref={importInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleImportChange}
        />
      </SheetContent>
    </Sheet>
  )
}
