import React from 'react'
import { useFormattedPrice } from 'vtex.formatted-price'

import { useFetchPrices, useFormatPrice, useOrganization } from '../../hooks'

type MarginProductPriceProps = {
  itemId: string
  sellingPrice: number
  measurementUnit?: string | null
}

export function MarginProductPrice({
  itemId,
  sellingPrice,
  measurementUnit,
}: MarginProductPriceProps) {
  const { organization } = useOrganization()
  const organizationPrice = organization?.priceTables?.[0] ?? '1'

  const { data } = useFetchPrices(itemId, organizationPrice)

  const formatPrice = useFormatPrice()
  const marginPrice = sellingPrice / 100 - (data?.costPrice ?? 0)
  const marginPriceDefaultFormat = useFormattedPrice(marginPrice)

  if (!data?.costPrice) return <>---</>

  return (
    <>
      {marginPrice === 0 ? formatPrice(marginPrice) : marginPriceDefaultFormat}
      {!!measurementUnit && !!marginPrice && `/${measurementUnit}`}
    </>
  )
}
