import { useQuery } from '@tanstack/react-query'

import { apiRequest } from '../services'
import { ApiResponse, Tax } from '../typings'
import { useOrderFormCustom } from './useOrderFormCustom'

export function useTaxes() {
  const { orderForm } = useOrderFormCustom()

  const hasTax = orderForm.items.some((item) =>
    item.priceTags.some((tag) => tag.name?.includes('tax@price'))
  )

  const uniqueTaxIds = new Set<string>()

  orderForm.items.forEach((item) => {
    item.priceTags.forEach((tag) => {
      if (tag.name?.includes('tax@price') && tag.identifier) {
        uniqueTaxIds.add(tag.identifier)
      }
    })
  })

  const taxIds = Array.from(uniqueTaxIds)

  return useQuery<ApiResponse & Tax[], Error>({
    queryKey: ['tax', ...taxIds],
    queryFn: async () => {
      return Promise.all(
        taxIds.map((taxId) =>
          apiRequest<ApiResponse & Tax>(
            `/api/rnb/pvt/calculatorconfiguration/${taxId}`,
            'get'
          )
        )
      )
    },
    enabled: hasTax,
  })
}
