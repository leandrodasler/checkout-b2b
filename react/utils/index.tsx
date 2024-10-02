import React from 'react'
import { Totalizer } from 'vtex.checkout-graphql'
import { FormattedPrice } from 'vtex.formatted-price'

export function getTotalizers(totalizers: Totalizer[], total: number) {
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
  },
}
