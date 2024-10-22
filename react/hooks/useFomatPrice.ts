import { useCallback } from 'react'
import { useRuntime } from 'vtex.render-runtime'

export function useFormatPrice() {
  const { locale, currency } = useRuntime().culture

  return useCallback(
    (value: number) => {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
      }).format(value)
    },
    [currency, locale]
  )
}
