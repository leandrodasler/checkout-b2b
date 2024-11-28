import { useQuery } from '@tanstack/react-query'

import { apiRequest } from '../services'
import type { ApiResponse } from '../typings'
import { useOrderFormCustom } from './useOrderFormCustom'
import { useOrganization } from './useOrganization'
import { usePermissions } from './usePermissions'

interface PriceResponse extends ApiResponse {
  itemId: string
  listPrice: number | null
  costPrice: number
  markup: number
  basePrice: number
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

  return useQuery<number, Error>({
    queryKey: ['fetchPrices', priceTable],
    enabled: canViewMargin && !!items.length,
    queryFn: async () => {
      const margins = await Promise.all(
        items.map((item) =>
          apiRequest<PriceResponse>(
            getPriceUrl({ skuId: item.id, priceTable }),
            'GET'
          )
            .then(
              (r) =>
                ((item.sellingPrice ?? 0) / 100 - r.costPrice) * item.quantity
            )
            .catch(() => 0)
        )
      )

      return margins.reduce((acc, margin) => acc + margin)
    },
  })
}
