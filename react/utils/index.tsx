import React from 'react'
import type { Totalizer } from 'vtex.checkout-graphql'
import { FormattedPrice } from 'vtex.formatted-price'

export function getTotalizers(totalizers: Totalizer[], total: number) {
  if (!totalizers.length) return null

  return [
    ...totalizers.map((t) => ({
      label: t.name,
      value: <FormattedPrice value={t.value / 100} />,
    })),
    {
      label: 'Total',
      value: <FormattedPrice value={total / 100} />,
    },
  ]
}

export const tableSchema = {
  properties: {
    skuName: {
      title: 'Name',
    },
    quantity: {
      title: 'Quantity',
    },
    sellingPrice: {
      title: 'Price',
      cellRenderer({ cellData }: { cellData: number }) {
        return <FormattedPrice value={cellData / 100} />
      },
    },
    productCategories: {
      title: 'Category',
      cellRenderer({ cellData }: { cellData: Record<string, string> }) {
        const categories = Object.values(cellData).join(' / ')

        return <span>{categories}</span>
      },
    },
  },
}
