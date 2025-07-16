import { useMemo } from 'react'
import { Item } from 'vtex.checkout-graphql'

import { CustomItem } from '../typings'

type UseGroupedProductsProps = {
  items: CustomItem[]
  fallbackItems?: CustomItem[]
  isGrouping: boolean
  expandedProducts: string[]
  searchStore: boolean
  getDiscountedPrice: (item: Item, discount: number) => number
  discountApplied: number
}

export function useGroupedProducts({
  items,
  fallbackItems,
  isGrouping,
  expandedProducts,
  searchStore,
  getDiscountedPrice,
  discountApplied,
}: UseGroupedProductsProps): CustomItem[] {
  return useMemo(() => {
    const baseItems = searchStore ? items : fallbackItems ?? items

    if (!isGrouping) return baseItems

    const seen = new Set<string>()
    const result: CustomItem[] = []

    const groupedByProductId = new Map<string, CustomItem[]>()

    for (const item of baseItems) {
      const key = item.productId ?? ''

      if (!groupedByProductId.has(key)) {
        groupedByProductId.set(key, [])
      }

      groupedByProductId.get(key)?.push({
        ...item,
        tax: (item as CustomItem & { tax?: number }).tax ?? undefined,
      })
    }

    for (const [key, groupItems] of groupedByProductId.entries()) {
      if (!seen.has(key)) {
        const [firstItem] = groupItems

        const totalDiscountedPrice = groupItems.reduce((acc, curr) => {
          const discounted = getDiscountedPrice(curr, discountApplied) ?? 0

          return acc + discounted
        }, 0)

        const totalQuantity = groupItems.reduce(
          (acc, curr) => acc + (curr.quantity ?? 0),
          0
        )

        result.push({
          ...firstItem,
          __group: true,
          productId: key,
          quantity: totalQuantity,
          price: totalDiscountedPrice,
          id: `group-${key}`,
        } as typeof firstItem & {
          __group: boolean
        })

        seen.add(key)
      }

      if (expandedProducts.includes(key)) {
        for (const item of groupItems) {
          result.push({
            ...item,
            tax: (item as CustomItem & { tax?: number }).tax ?? undefined,
          })
        }
      }
    }

    return result
  }, [
    items,
    fallbackItems,
    isGrouping,
    expandedProducts,
    searchStore,
    getDiscountedPrice,
    discountApplied,
  ])
}
