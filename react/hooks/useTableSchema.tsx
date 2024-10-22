import React from 'react'
import { useIntl } from 'react-intl'
import { Button, IconDelete } from 'vtex.styleguide'
import { Item } from 'vtex.checkout-graphql'
import { OrderItems } from 'vtex.order-items'
import { useRuntime } from 'vtex.render-runtime'
import { FormattedPrice } from 'vtex.formatted-price'

import { TableSchema } from '../typings'
import { TruncatedText } from '../components/TruncatedText'
import { QuantitySelector } from '../components/QuantitySelector'
import { isWithoutStock, messages, normalizeString } from '../utils'

function getStrike(item: Item) {
  return { strike: isWithoutStock(item) }
}

export function useTableSchema(): TableSchema<Item> {
  const { account } = useRuntime()
  const { formatMessage } = useIntl()

  const { useOrderItems } = OrderItems

  const { removeItem } = useOrderItems()

  return {
    properties: {
      refId: {
        title: formatMessage(messages.refId),
        width: 120,
        cellRenderer({ rowData }) {
          return <TruncatedText text={rowData.refId} {...getStrike(rowData)} />
        },
      },
      skuName: {
        minWidth: 250,
        title: formatMessage(messages.name),
        cellRenderer({ rowData }) {
          const { name, skuName } = rowData
          const displayName = normalizeString(skuName).includes(
            normalizeString(name)
          )
            ? skuName
            : `${name} - ${skuName}`

          return <TruncatedText text={displayName} {...getStrike(rowData)} />
        },
      },
      additionalInfo: {
        width: 120,
        title: formatMessage(messages.brand),
        cellRenderer({ rowData }) {
          const brandName = rowData.additionalInfo?.brandName ?? 'N/A'

          return <TruncatedText text={brandName} {...getStrike(rowData)} />
        },
      },
      productCategories: {
        width: 150,
        title: formatMessage(messages.category),
        cellRenderer({ rowData }) {
          const categoriesArray = Object.values(
            rowData.productCategories as Record<string, string>
          )

          const categories = categoriesArray.join(' / ')
          const leadCategory = categoriesArray[categoriesArray.length - 1]

          return (
            <TruncatedText
              label={categories}
              text={leadCategory}
              {...getStrike(rowData)}
            />
          )
        },
      },
      seller: {
        width: 150,
        title: formatMessage(messages.seller),
        cellRenderer({ rowData }) {
          const seller =
            rowData.seller === '1'
              ? account.charAt(0).toUpperCase() + account.slice(1)
              : rowData.seller

          return (
            <TruncatedText text={seller ?? 'N/A'} {...getStrike(rowData)} />
          )
        },
      },
      sellingPrice: {
        width: 120,
        title: formatMessage(messages.price),
        cellRenderer({ rowData }) {
          return (
            rowData.sellingPrice && (
              <TruncatedText
                text={<FormattedPrice value={rowData.sellingPrice / 100} />}
                {...getStrike(rowData)}
              />
            )
          )
        },
      },
      quantity: {
        width: 110,
        title: <div className="tc">{formatMessage(messages.quantity)}</div>,
        cellRenderer({ rowData }) {
          return <QuantitySelector item={rowData} />
        },
      },
      priceDefinition: {
        width: 120,
        title: formatMessage(messages.totalPrice),
        cellRenderer({ rowData }) {
          const totalPrice = rowData?.priceDefinition?.total

          return (
            totalPrice && (
              <TruncatedText
                text={<FormattedPrice value={totalPrice / 100} />}
                {...getStrike(rowData)}
              />
            )
          )
        },
      },
      options: {
        minWidth: 1,
        title: formatMessage(messages.removeItem),
        cellRenderer({ rowData }) {
          return (
            <Button
              icon
              variation="danger-tertiary"
              aria-label={formatMessage(messages.removeItem)}
              size="small"
              type="button"
              onClick={() => {
                removeItem({ id: rowData.id, seller: rowData.seller ?? '1' })
              }}
            >
              <IconDelete title={formatMessage(messages.removeItem)} />
            </Button>
          )
        },
      },
    },
  }
}
