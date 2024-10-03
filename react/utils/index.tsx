import React from 'react'
import { OrderForm, Totalizer } from 'vtex.checkout-graphql'
import { FormattedPrice } from 'vtex.formatted-price'

export function getTotalizers(
  totalizers: Totalizer[],
  shipping: OrderForm['shipping'],
  total: number
) {
  if (!totalizers.length) return null

  const formattedAddress = shipping?.selectedAddress
    ? `${shipping.selectedAddress.street}, Nº ${shipping.selectedAddress.number} - ${shipping.selectedAddress.city}, ${shipping.selectedAddress.state}`
    : 'Endereço não informado'

  return [
    ...totalizers.map((t) => ({
      label: t.name,
      value: <FormattedPrice value={t.value / 100} />,
    })),
    {
      label: 'Endereço de entrega',
      value: formattedAddress,
      isLoading: false,
    },
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
