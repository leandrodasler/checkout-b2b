import React from 'react'
import { useIntl } from 'react-intl'
import { Item } from 'vtex.checkout-graphql'
import { FormattedPrice } from 'vtex.formatted-price'
import { OrderItems } from 'vtex.order-items'
import { useRuntime } from 'vtex.render-runtime'
import { NumericStepper } from 'vtex.styleguide'

import { TruncatedText } from '../components/TruncatedText'
import { messages } from '../utils'

type CellRendererArgs<T = undefined> = {
  cellData: T
  rowData: Item
}

export function useTableSchema() {
  const { useOrderItems } = OrderItems
  const { account } = useRuntime()
  const { formatMessage } = useIntl()
  const { updateQuantity } = useOrderItems()

  return {
    properties: {
      refId: {
        title: formatMessage(messages.refId),
        width: 120,
      },
      skuName: {
        minWidth: 250,
        title: formatMessage(messages.name),
        cellRenderer({ rowData }: CellRendererArgs) {
          const { name, skuName } = rowData
          const displayName = name === skuName ? name : `${name} - ${skuName}`

          return <TruncatedText text={displayName as string} />
        },
      },
      additionalInfo: {
        width: 120,
        title: formatMessage(messages.brand),
        cellRenderer({ cellData }: CellRendererArgs<Item['additionalInfo']>) {
          const brandName = cellData?.brandName ?? 'N/A'

          return <TruncatedText text={brandName} />
        },
      },
      productCategories: {
        width: 150,
        title: formatMessage(messages.category),
        cellRenderer({ cellData }: CellRendererArgs<Record<string, string>>) {
          const categoriesArray = Object.values(cellData)
          const categories = categoriesArray.join(' / ')
          const leadCategory = categoriesArray[categoriesArray.length - 1]

          return <TruncatedText label={categories} text={leadCategory} />
        },
      },
      seller: {
        width: 200,
        title: formatMessage(messages.seller),
        cellRenderer({ cellData }: CellRendererArgs<Item['seller']>) {
          const seller =
            cellData === '1'
              ? account.charAt(0).toUpperCase() + account.slice(1)
              : cellData

          return <TruncatedText text={seller ?? 'N/A'} />
        },
      },
      sellingPrice: {
        width: 100,
        title: formatMessage(messages.price),
        cellRenderer({ cellData }: CellRendererArgs<Item['sellingPrice']>) {
          return !!cellData && <FormattedPrice value={cellData / 100} />
        },
      },
      quantity: {
        width: 110,
        title: <div className="tc">{formatMessage(messages.quantity)}</div>,
        cellRenderer({ rowData }: CellRendererArgs<Item['quantity']>) {
          return (
            <NumericStepper
              size="small"
              value={rowData.quantity}
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
        width: 120,
        title: formatMessage(messages.totalPrice),
        cellRenderer({ cellData }: CellRendererArgs<Item['priceDefinition']>) {
          const totalPrice = cellData?.total

          return totalPrice && <FormattedPrice value={totalPrice / 100} />
        },
      },
    },
  }
}
