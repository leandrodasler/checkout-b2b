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

function normalizeTax(item: CustomItem): CustomItem {
  return {
    ...item,
    tax: item.tax ?? undefined,
    components: item.components ?? undefined,
  }
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

    const grouped = baseItems.reduce<Map<string, CustomItem[]>>((acc, item) => {
      const key = item.productId ?? ''

      if (!acc.has(key)) {
        acc.set(key, [])
      }

      acc.get(key)?.push(normalizeTax(item))

      return acc
    }, new Map())

    const result: CustomItem[] = []

    for (const [productId, groupItems] of grouped.entries()) {
      const [firstItem] = groupItems

      const totalPrice = groupItems.reduce((acc, curr) => {
        return acc + (getDiscountedPrice(curr, discountApplied) ?? 0)
      }, 0)

      const totalQuantity = groupItems.reduce(
        (acc, curr) => acc + (curr.quantity ?? 0),
        0
      )

      const groupedItem: CustomItem = {
        ...firstItem,
        __group: true,
        id: `group-${productId}`,
        productId,
        price: totalPrice,
        quantity: totalQuantity,
      }

      result.push(groupedItem)

      if (expandedProducts.includes(productId)) {
        for (const item of groupItems) {
          const enrichedItem = normalizeTax(item)

          result.push(enrichedItem)

          if (enrichedItem.components && enrichedItem.components.length > 0) {
            for (const component of enrichedItem.components) {
              const normalizedComponent: CustomItem = {
                ...component,
                id: `${enrichedItem.id}`,
                __component: true,
                parentItemId: enrichedItem.id,
                tax: component.tax ?? undefined,
                components: component.components ?? undefined,
              }

              result.push(normalizedComponent)
            }
          }
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
