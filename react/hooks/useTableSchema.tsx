import React from 'react'
import { useIntl } from 'react-intl'
import { Item } from 'vtex.checkout-graphql'
import { FormattedPrice } from 'vtex.formatted-price'
import { OrderItems } from 'vtex.order-items'
import { useRuntime } from 'vtex.render-runtime'
import { NumericStepper } from 'vtex.styleguide'

import { TruncatedColumn } from '../components/TruncatedColumn'
import { messages } from '../utils'

export function useTableSchema() {
  const { useOrderItems } = OrderItems

  const { account } = useRuntime()
  const { formatMessage } = useIntl()
  const { updateQuantity } = useOrderItems()

  return {
    properties: {
      refId: {
        title: formatMessage(messages.refId),
        width: 150,
        cellRenderer({ cellData }: { cellData: string }) {
          return <span>{cellData}</span>
        },
      },
      skuName: {
        minWidth: 250,
        title: formatMessage(messages.name),
        cellRenderer({ cellData }: { cellData: string }) {
          return <TruncatedColumn text={cellData} />
        },
      },
      additionalInfo: {
        width: 150,
        title: formatMessage(messages.brand),
        cellRenderer({ cellData }: { cellData: { brandName: string } }) {
          const brandName = cellData?.brandName ?? 'N/A'

          return <TruncatedColumn text={brandName} />
        },
      },
      productCategories: {
        width: 200,
        title: formatMessage(messages.category),
        cellRenderer({ cellData }: { cellData: Record<string, string> }) {
          const categoriesArray = Object.values(cellData)
          const categories = categoriesArray.join(' / ')
          const leadCategory = categoriesArray[categoriesArray.length - 1]

          return <TruncatedColumn label={categories} text={leadCategory} />
        },
      },
      seller: {
        width: 200,
        title: formatMessage(messages.seller),
        cellRenderer({ cellData }: { cellData: string }) {
          const seller =
            cellData === '1'
              ? account.charAt(0).toUpperCase() + account.slice(1)
              : cellData

          return <TruncatedColumn text={seller} />
        },
      },
      sellingPrice: {
        width: 100,
        title: formatMessage(messages.price),
        cellRenderer({ cellData }: { cellData: number }) {
          return <FormattedPrice value={cellData / 100} />
        },
      },
      quantity: {
        width: 180,
        title: formatMessage(messages.quantity),
        cellRenderer({
          cellData,
          rowData,
        }: {
          cellData: number
          rowData: Item
        }) {
          return (
            <NumericStepper
              size="small"
              value={cellData}
              minValue={1}
              onChange={({ value }: { value: number }) => {
                if (value > 0) {
                  updateQuantity({
                    id: rowData.id,
                    seller: rowData.seller as string,
                    quantity: value,
                  })
                }
              }}
            />
          )
        },
      },
      priceDefinition: {
        width: 100,
        title: formatMessage(messages.totalPrice),
        cellRenderer({ cellData }: { cellData: Record<string, number> }) {
          const totalPrice = cellData.total

          return <FormattedPrice value={totalPrice / 100} />
        },
      },
    },
  }
}
