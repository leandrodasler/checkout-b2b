import React from 'react'
import { useFormattedPrice } from 'vtex.formatted-price'

import { useComputedPrices, useFormatPrice } from '../../hooks'

type MarginProductPriceProps = {
  itemId: string
  sellingPrice: number
  measurementUnit?: string | null
  isUnavailable?: boolean
}

export function MarginProductPrice({
  itemId,
  sellingPrice,
  measurementUnit,
  isUnavailable,
}: MarginProductPriceProps) {
  const formatPrice = useFormatPrice()
  const { computedPrices } = useComputedPrices()

  const costPrice =
    computedPrices.find((computedPrice) => computedPrice.skuId === itemId)
      ?.costPrice ?? 0

  const marginPrice = sellingPrice / 100 - costPrice
  const marginPriceDefaultFormat = useFormattedPrice(marginPrice)

  if (isUnavailable || !costPrice) return <>---</>

  return (
    <>
      {marginPrice === 0 ? formatPrice(marginPrice) : marginPriceDefaultFormat}
      {!!measurementUnit && !!marginPrice && `/${measurementUnit}`}
    </>
  )
}
