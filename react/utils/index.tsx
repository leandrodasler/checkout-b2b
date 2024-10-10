import React from 'react'
import { useIntl } from 'react-intl'
import type { OrderForm, Totalizer } from 'vtex.checkout-graphql'
import { FormattedPrice } from 'vtex.formatted-price'
import { useRuntime } from 'vtex.render-runtime'

import { messages } from './messages'

export function useTotalizers(
  totalizers: Totalizer[],
  shipping: OrderForm['shipping'],
  total: number
) {
  const { formatMessage } = useIntl()

  if (!totalizers.length) return null

  let formattedAddress = formatMessage(messages.emptyAddress)

  if (shipping?.selectedAddress) {
    const { street, number, city, state } = shipping?.selectedAddress

    formattedAddress = `${street}${
      number ? `, ${number}` : ''
    } - ${city}, ${state}`
  }

  return [
    {
      label: formatMessage(messages.selectedAddress),
      value: formattedAddress,
      isLoading: false,
    },
    ...totalizers.map((t) => ({
      label: t.name,
      value: <FormattedPrice value={t.value / 100} />,
    })),
    {
      label: formatMessage(messages.total),
      value: <FormattedPrice value={total / 100} />,
    },
  ]
}

export const useTableSchema = () => {
  const { formatMessage } = useIntl()
  const { account } = useRuntime()

  return {
    properties: {
      skuName: {
        minWidth: 300,
        title: formatMessage(messages.name),
        cellRenderer({ cellData }: { cellData: string }) {
          return (
            <span className="truncate" title={cellData}>
              {cellData}
            </span>
          )
        },
      },
      refId: {
        title: formatMessage(messages.refId),
        width: 170,
        cellRenderer({ cellData }: { cellData: string }) {
          return <span>{cellData}</span>
        },
      },
      quantity: {
        width: 100,
        title: formatMessage(messages.quantity),
      },
      additionalInfo: {
        width: 150,
        title: formatMessage(messages.brand),
        cellRenderer({ cellData }: { cellData: { brandName: string } }) {
          const brandName = cellData?.brandName ?? 'N/A'

          return (
            <span className="truncate" title={brandName}>
              {brandName}
            </span>
          )
        },
      },
      sellingPrice: {
        width: 150,
        title: formatMessage(messages.price),
        cellRenderer({ cellData }: { cellData: number }) {
          return <FormattedPrice value={cellData / 100} />
        },
      },
      productCategories: {
        width: 300,
        title: formatMessage(messages.category),
        cellRenderer({ cellData }: { cellData: Record<string, string> }) {
          const categories = Object.values(cellData).join(' / ')

          return <span title={categories}>{categories}</span>
        },
      },
      seller: {
        width: 150,
        title: formatMessage(messages.seller),
        cellRenderer({ cellData }: { cellData: string }) {
          const seller =
            cellData === '1'
              ? account.charAt(0).toUpperCase() + account.slice(1)
              : cellData

          return <span>{seller}</span>
        },
      },
      priceDefinition: {
        width: 150,
        title: formatMessage(messages.totalPrice),
        cellRenderer({ cellData }: { cellData: Record<string, number> }) {
          const totalPrice = cellData.total

          return <FormattedPrice value={totalPrice / 100} />
        },
      },
    },
  }
}
