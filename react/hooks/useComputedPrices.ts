import { useMemo } from 'react'
import { useQuery } from 'react-apollo'
import {
  ComputedPrice,
  Query,
  QueryGetComputedPricesArgs,
} from 'ssesandbox04.checkout-b2b'

import GET_COMPUTED_PRICES from '../graphql/getComputedPrices.graphql'
import { isItemUnavailable } from '../utils'
import { useOrderFormCustom } from './useOrderFormCustom'
import { useToast } from './useToast'

type GetComputedPricesQuery = Pick<Query, 'getComputedPrices'>

export function useComputedPrices() {
  const { orderForm } = useOrderFormCustom()
  const items = orderForm.items.filter((item) => !isItemUnavailable(item))
  const uniqueSkuIds = new Set(items.map((item) => item.id))

  const { data, loading } = useQuery<
    GetComputedPricesQuery,
    QueryGetComputedPricesArgs
  >(GET_COMPUTED_PRICES, {
    skip: !uniqueSkuIds.size,
    variables: { skuIds: [...uniqueSkuIds] },
    onError: useToast,
  })

  const computedPrices: ComputedPrice[] = useMemo(
    () => data?.getComputedPrices ?? [],
    [data?.getComputedPrices]
  )

  const totalMargin = useMemo(
    () =>
      computedPrices
        .map((computedPrice) => {
          const cartItem = items.find((i) => i.id === computedPrice.skuId)

          if (!computedPrice?.costPrice || !cartItem) return 0

          const sellingPrice = (cartItem.sellingPrice ?? 0) / 100

          return (sellingPrice - computedPrice.costPrice) * cartItem.quantity
        })
        .reduce((acc, margin) => acc + margin, 0),
    [computedPrices, items]
  )

  return { computedPrices, totalMargin, loading }
}
