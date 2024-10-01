import React from 'react'
import { FormattedPrice } from 'vtex.formatted-price'
import { OrderForm } from 'vtex.order-manager'
import { Table } from 'vtex.styleguide'

type Totalizer = {
  name: string
  value: number
}

function CheckoutB2B() {
  const { useOrderForm } = OrderForm
  const { loading, orderForm } = useOrderForm()
  const { items, totalizers, value: total, ...rest } = orderForm

  const defaultSchema = {
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

  const mappedTotalizers = loading
    ? null
    : [
        ...totalizers.map((t: Totalizer) => ({
          label: t.name,
          value: <FormattedPrice value={t.value / 100} />,
        })),
        {
          label: 'Total',
          value: <FormattedPrice value={total / 100} />,
        },
      ]

  // eslint-disable-next-line no-console
  console.log('ITEMS:', items)

  // eslint-disable-next-line no-console
  console.log('OUTROS OBJETOS NO ORDER FORM:', rest)

  return (
    <Table
      totalizers={mappedTotalizers}
      loading={loading}
      fullWidth
      schema={defaultSchema}
      items={items}
      density="high"
    />
  )
}

export default CheckoutB2B
