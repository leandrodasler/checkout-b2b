import { useQuery } from '@tanstack/react-query'

import { apiRequest } from '../services'
import type { ApiResponse } from '../typings'

interface PriceResponse extends ApiResponse {
  itemId: string
  listPrice: number | null
  costPrice: number
  markup: number
  basePrice: number
}

interface PriceTable {
  productId: string
  priceTable: string
}

const getPriceUrl = (infosPrice: PriceTable) =>
  `/api/pricing/prices/${infosPrice.productId}/computed/${infosPrice.priceTable}`

export function useFetchPrices(productId: string, priceTable: string) {
  return useQuery<PriceResponse, Error>({
    queryKey: ['fetchPrices', productId, priceTable],
    queryFn: () =>
      apiRequest<PriceResponse>(getPriceUrl({ productId, priceTable }), 'GET'),
    onError: (error) => {
      console.error(`Error fetching prices: ${error.message}`)
    },
  })
}
