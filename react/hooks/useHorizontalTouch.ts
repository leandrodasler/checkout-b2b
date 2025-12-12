import { useCallback, useRef } from 'react'

type Props = {
  onTouchToLeft?: () => void
  onTouchToRight?: () => void
  thresholdPx?: number
}

export function useHorizontalTouch<T extends HTMLElement = HTMLDivElement>({
  onTouchToLeft,
  onTouchToRight,
  thresholdPx = 30,
}: Props) {
  const startXRef = useRef<number | null>(null)
  const startYRef = useRef<number | null>(null)

  const onTouchStart = useCallback((e: React.TouchEvent<T>) => {
    const touch = e.touches.item(0)

    if (!touch) return

    startXRef.current = touch.clientX
    startYRef.current = touch.clientY
  }, [])

  const onTouchEnd = useCallback(
    (e: React.TouchEvent<T>) => {
      const touch = e.changedTouches.item(0)

      if (!touch) return

      const startX = startXRef.current
      const startY = startYRef.current

      if (startX == null || startY == null) return

      const dx = touch.clientX - startX
      const dy = touch.clientY - startY

      if (Math.abs(dx) < Math.abs(dy) || Math.abs(dx) < thresholdPx) return

      if (dx < 0) {
        onTouchToLeft?.()
      } else {
        onTouchToRight?.()
      }

      startXRef.current = null
      startYRef.current = null
    },
    [onTouchToLeft, onTouchToRight, thresholdPx]
  )

  const onTouchCancel = useCallback(() => {
    startXRef.current = null
    startYRef.current = null
  }, [])

  return {
    onTouchStart,
    onTouchEnd,
    onTouchCancel,
  } as const
}
