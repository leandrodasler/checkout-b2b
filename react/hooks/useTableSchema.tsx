import React, { useMemo } from 'react'
import { useIntl } from 'react-intl'
import type { Item } from 'vtex.checkout-graphql'
import { FormattedPrice } from 'vtex.formatted-price'
import { OrderItems } from 'vtex.order-items'
import { ButtonWithIcon, IconDelete } from 'vtex.styleguide'

import { MarginProductPrice } from '../components/MarginProductPrice'
import { QuantitySelector } from '../components/QuantitySelector'
import { TruncatedText } from '../components/TruncatedText'
import type { TableSchema } from '../typings'
import { isWithoutStock, messages, normalizeString } from '../utils'
import { useOrderFormCustom } from './useOrderFormCustom'

const { useOrderItems } = OrderItems

function getStrike(item: Item) {
  return { strike: isWithoutStock(item) }
}

export function useTableSchema(): TableSchema<Item> {
  const { orderForm } = useOrderFormCustom()
  const { formatMessage } = useIntl()
  const { removeItem } = useOrderItems()

  return useMemo(
    () => ({
      properties: {
        refId: {
          title: formatMessage(messages.refId),
          width: 120,
          cellRenderer({ rowData }) {
            return (
              <TruncatedText text={rowData.refId} {...getStrike(rowData)} />
            )
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
            const seller = orderForm.sellers?.find(
              (s) => rowData.seller === s?.id
            )

            const sellerName = seller?.name ?? rowData.seller ?? 'N/A'

            return <TruncatedText text={sellerName} {...getStrike(rowData)} />
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
        listPrice: {
          width: 100,
          title: formatMessage(messages.margin),
          cellRenderer({ rowData }) {
            return (
              <TruncatedText
                text={
                  <MarginProductPrice
                    itemId={rowData.id}
                    sellingPrice={rowData.sellingPrice ?? 0}
                  />
                }
                {...getStrike(rowData)}
              />
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
        id: {
          width: 50,
          title: ' ',
          cellRenderer({ rowData }) {
            return (
              <ButtonWithIcon
                size="small"
                icon={<IconDelete />}
                variation="danger-tertiary"
                onClick={() => {
                  removeItem({ id: rowData.id, seller: rowData.seller ?? '1' })
                }}
              />
            )
          },
        },
      },
    }),
    [orderForm, formatMessage, removeItem]
  )
}
