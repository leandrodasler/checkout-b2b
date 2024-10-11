import React from 'react'
import { useIntl } from 'react-intl'
import { OrderItems } from 'vtex.order-items'
import { useRuntime } from 'vtex.render-runtime'
import { FormattedPrice } from 'vtex.formatted-price'
import { Tooltip, NumericStepper } from 'vtex.styleguide'

import { messages } from '../utils'

export function useTableSchema() {
  const { useOrderItems } = OrderItems

  const { account } = useRuntime()
  const { formatMessage } = useIntl()
  const { updateQuantity } = useOrderItems()

  return {
    properties: {
      skuName: {
        minWidth: 250,
        title: formatMessage(messages.name),
        cellRenderer({ cellData }: { cellData: string }) {
          return (
            <Tooltip label={cellData}>
              <span className="truncate">{cellData}</span>
            </Tooltip>
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
      quantity: {
        width: 150,
        title: formatMessage(messages.quantity),
        cellRenderer({
          cellData,
          rowData,
        }: {
          cellData: number
          rowData: { id: string; seller: string; refId: string }
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
                    seller: rowData.seller,
                    quantity: value,
                  })
                }
              }}
            />
          )
        },
      },
    },
  }
}
