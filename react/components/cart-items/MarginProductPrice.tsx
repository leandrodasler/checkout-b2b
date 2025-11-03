import React from 'react'

import { useFetchPrices, useFormatPrice, useOrganization } from '../../hooks'

type MarginProductPriceProps = {
  itemId: string
  sellingPrice: number
}

export function MarginProductPrice({
  itemId,
  sellingPrice,
}: MarginProductPriceProps) {
  const { organization } = useOrganization()
  const organizationPrice = organization?.priceTables?.[0] ?? '1'

  const { data } = useFetchPrices(itemId, organizationPrice)

  const formatPrice = useFormatPrice()

  if (!data?.costPrice) return <>---</>

  const marginPrice = sellingPrice / 100 - data.costPrice

  return <>{formatPrice(marginPrice)}</>
}
