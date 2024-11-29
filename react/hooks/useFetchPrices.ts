import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { apiRequest } from '../services'
import type { ApiResponse } from '../typings'
import { useOrderFormCustom } from './useOrderFormCustom'
import { useOrganization } from './useOrganization'
import { usePermissions } from './usePermissions'

interface PriceResponse extends ApiResponse {
  itemId: string
  costPrice?: number | null
}

interface PriceTable {
  skuId: string
  priceTable: string
}

const getPriceUrl = (infosPrice: PriceTable) =>
  `/api/pricing/prices/${infosPrice.skuId}/computed/${infosPrice.priceTable}`

export function useFetchPrices(skuId: string, priceTable: string) {
  return useQuery<PriceResponse, Error>({
    queryKey: ['fetchPrices', skuId, priceTable],
    queryFn: () =>
      apiRequest<PriceResponse>(getPriceUrl({ skuId, priceTable }), 'GET'),
    onError: (error) => {
      console.error(`Error fetching prices: ${error.message}`)
    },
  })
}

export function useTotalMargin() {
  const { orderForm } = useOrderFormCustom()
  const { organization } = useOrganization()
  const { canViewMargin } = usePermissions()
  const { items } = orderForm
  const priceTable = organization?.priceTables?.[0] ?? '1'

  const { data } = useQuery<PriceResponse[], Error>({
    queryKey: ['fetchPrices', priceTable],
    enabled: canViewMargin && !!items.length,
    queryFn: async () =>
      Promise.all(
        items.map((item) =>
          apiRequest<PriceResponse>(
            getPriceUrl({ skuId: item.id, priceTable }),
            'GET'
          )
            .then((r) => ({ ...r, itemId: item.id }))
            .catch(() => ({ itemId: item.id, costPrice: null }))
        )
      ),
  })

  const totalMargin = useMemo(
    () =>
      data
        ?.map((item) => {
          const cartItem = items.find((i) => i.id === item.itemId)

          if (!item?.costPrice) return 0

          return (
            ((cartItem?.sellingPrice ?? 0) / 100 - item.costPrice) *
            (cartItem?.quantity ?? 0)
          )
        })
        .reduce((acc, margin) => acc + margin),
    [data, items]
  )

  return totalMargin
}
