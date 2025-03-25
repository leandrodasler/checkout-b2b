import { useCallback, useEffect, useRef } from 'react'

export const useDebounce = (cb: (term: string) => void, delay = 500) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  return useCallback(
    (term: string) => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
      }

      timerRef.current = setTimeout(() => {
        cb(term)
      }, delay)
    },
    [cb, delay]
  )
}
