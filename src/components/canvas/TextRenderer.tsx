import { useRef, useEffect, useState, useCallback } from 'react'
import { Text as KonvaText } from 'react-konva'
import type { KonvaEventObject } from 'konva/lib/Node'
import type Konva from 'konva'
import type { TextObject } from '@/types'

interface TextRendererProps {
  obj: TextObject
  isSelected: boolean
  draggable?: boolean
  onSelect: (id: string) => void
  onTransformEnd: (e: KonvaEventObject<Event>) => void
  onDragEnd: (e: KonvaEventObject<DragEvent>) => void
  onTextChange: (id: string, text: string) => void
}

export function TextRenderer({
  obj,
  isSelected,
  draggable = false,
  onSelect,
  onTransformEnd,
  onDragEnd,
  onTextChange,
}: TextRendererProps) {
  const textRef = useRef<Konva.Text>(null)
  const [isEditing, setIsEditing] = useState(false)

  const handleDblClick = useCallback(() => {
    if (!textRef.current) return
    setIsEditing(true)

    const textNode = textRef.current
    const stage = textNode.getStage()
    if (!stage) return

    const textPosition = textNode.absolutePosition()
    const stageBox = stage.container().getBoundingClientRect()

    const areaPosition = {
      x: stageBox.left + textPosition.x,
      y: stageBox.top + textPosition.y,
    }

    const textarea = document.createElement('textarea')
    document.body.appendChild(textarea)

    textarea.value = obj.text
    textarea.style.position = 'fixed'
    textarea.style.top = `${areaPosition.y}px`
    textarea.style.left = `${areaPosition.x}px`
    textarea.style.width = `${Math.max(obj.width * textNode.scaleX(), 100)}px`
    textarea.style.height = `${Math.max(obj.height * textNode.scaleY(), 30)}px`
    textarea.style.fontSize = `${obj.fontSize}px`
    textarea.style.border = '2px solid #60a5fa'
    textarea.style.borderRadius = '4px'
    textarea.style.padding = '4px'
    textarea.style.margin = '0'
    textarea.style.overflow = 'hidden'
    textarea.style.background = 'rgba(15, 23, 42, 0.9)'
    textarea.style.color = obj.fill
    textarea.style.fontFamily = obj.fontFamily
    textarea.style.outline = 'none'
    textarea.style.resize = 'none'
    textarea.style.lineHeight = '1.2'
    textarea.style.zIndex = '10000'
    textarea.focus()

    const removeTextarea = () => {
      if (textarea.parentNode) {
        const newText = textarea.value
        textarea.parentNode.removeChild(textarea)
        setIsEditing(false)
        onTextChange(obj.id, newText)
      }
    }

    textarea.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        removeTextarea()
      }
      if (e.key === 'Escape') {
        removeTextarea()
      }
    })
    textarea.addEventListener('blur', removeTextarea)
  }, [obj, onTextChange])

  return (
    <KonvaText
      ref={textRef}
      id={obj.id}
      x={obj.x}
      y={obj.y}
      text={obj.text}
      fontSize={obj.fontSize}
      fontFamily={obj.fontFamily}
      fill={obj.fill}
      width={obj.width}
      rotation={obj.rotation}
      scaleX={obj.scaleX}
      scaleY={obj.scaleY}
      visible={obj.visible && !isEditing}
      draggable={draggable}
      onClick={() => onSelect(obj.id)}
      onTap={() => onSelect(obj.id)}
      onDblClick={handleDblClick}
      onDblTap={handleDblClick}
      onTransformEnd={onTransformEnd}
      onDragEnd={onDragEnd}
    />
  )
}
