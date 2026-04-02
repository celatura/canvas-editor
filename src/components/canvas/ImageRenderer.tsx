import { useEffect, useState } from 'react'
import { Image as KonvaImage } from 'react-konva'
import type { KonvaEventObject } from 'konva/lib/Node'
import type { ImageObject } from '@/types'

interface ImageRendererProps {
  obj: ImageObject
  isSelected: boolean
  onSelect: (id: string) => void
  onTransformEnd: (e: KonvaEventObject<Event>) => void
  onDragEnd: (e: KonvaEventObject<DragEvent>) => void
}

export function ImageRenderer({
  obj,
  isSelected,
  onSelect,
  onTransformEnd,
  onDragEnd,
}: ImageRendererProps) {
  const [image, setImage] = useState<HTMLImageElement | null>(null)

  useEffect(() => {
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => setImage(img)
    img.src = obj.src
  }, [obj.src])

  if (!image) return null

  return (
    <KonvaImage
      id={obj.id}
      image={image}
      x={obj.x}
      y={obj.y}
      width={obj.width}
      height={obj.height}
      rotation={obj.rotation}
      scaleX={obj.scaleX}
      scaleY={obj.scaleY}
      visible={obj.visible}
      draggable={isSelected}
      onClick={() => onSelect(obj.id)}
      onTap={() => onSelect(obj.id)}
      onTransformEnd={onTransformEnd}
      onDragEnd={onDragEnd}
    />
  )
}
