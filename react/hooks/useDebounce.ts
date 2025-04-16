import { useCallback, useEffect, useRef } from 'react'

export const useDebounce = <T extends unknown[]>(
  cb: (...args: T) => void,
  delay = 500
) => {
  const timerRef = useRef<number>()
  const clear = () => window.clearTimeout(timerRef.current)

  useEffect(() => clear, [])

  return useCallback(
    (...args: T) => {
      clear()
      timerRef.current = window.setTimeout(() => cb(...args), delay)
    },
    [cb, delay]
  )
}
