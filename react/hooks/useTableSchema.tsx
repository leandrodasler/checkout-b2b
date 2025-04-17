import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useIntl } from 'react-intl'
import { FormattedPrice } from 'vtex.formatted-price'
import { OrderItems } from 'vtex.order-items'
import { ButtonWithIcon, IconDelete, Tooltip } from 'vtex.styleguide'

import { useOrderFormCustom, usePermissions } from '.'
import { useCheckoutB2BContext } from '../CheckoutB2BContext'
import ManualPrice from '../components/ManualPrice'
import { MarginProductPrice } from '../components/MarginProductPrice'
import { QuantitySelector } from '../components/QuantitySelector'
import { TruncatedText } from '../components/TruncatedText'
import type { CustomItem, TableSchema } from '../typings'
import { isWithoutStock, messages, normalizeString } from '../utils'

const { useOrderItems } = OrderItems

function getStrike(item: CustomItem) {
  return { strike: isWithoutStock(item) }
}

export function useTableSchema(
  isEditing: boolean,
  discount: number,
  onUpdatePrice: (id: string, newPrice: number) => void
): TableSchema<CustomItem> {
  const { orderForm } = useOrderFormCustom()
  const { formatMessage } = useIntl()
  const { removeItem } = useOrderItems()
  const { isSalesUser } = usePermissions()
  const {
    getSellingPrice,
    getDiscountedPrice,
    setSubtotal,
    setListedPrice,
  } = useCheckoutB2BContext()

  const [updatedPrices, setUpdatedPrices] = useState<Record<string, number>>({})

  const handlesNewPrice = useCallback(
    (id: string, newPrice: number) => {
      onUpdatePrice(id, newPrice)
      setUpdatedPrices((prevPrices) => ({
        ...prevPrices,
        [id]: newPrice,
      }))
    },
    [onUpdatePrice]
  )

  useEffect(() => {
    const totalValue = orderForm.items?.reduce((acc, item) => {
      const quantity = item.quantity ?? 0
      const price = updatedPrices[item.id] ?? item.sellingPrice ?? 0

      return acc + quantity * price
    }, 0)

    const totalListPrice = orderForm.items?.reduce((acc, item) => {
      const quantity = item.quantity ?? 0
      const sellingPrice = item.price ?? 0

      return acc + sellingPrice * quantity
    }, 0)

    setListedPrice(totalListPrice)

    setSubtotal(totalValue)
  }, [orderForm.items, updatedPrices, setSubtotal, setListedPrice])

  const hasTax = useMemo(() => {
    return orderForm.items?.some((item) => !!item.tax) ?? false
  }, [orderForm.items])

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
          width: 150,
          title: formatMessage(messages.price),
          cellRenderer({ rowData }) {
            return (
              <ManualPrice
                rowData={rowData}
                isEditing={isEditing}
                sliderValue={discount}
                onUpdatePrice={handlesNewPrice}
              />
            )
          },
        },
        ...(isSalesUser && {
          listPrice: {
            width: 100,
            title: formatMessage(messages.margin),
            cellRenderer({ rowData }) {
              const sellingPrice = getSellingPrice(rowData, discount)

              return (
                <TruncatedText
                  text={
                    <MarginProductPrice
                      itemId={rowData.id}
                      sellingPrice={sellingPrice}
                    />
                  }
                  {...getStrike(rowData)}
                />
              )
            },
          },
        }),
        quantity: {
          width: 110,
          title: <div className="tc">{formatMessage(messages.quantity)}</div>,
          cellRenderer({ rowData }) {
            return <QuantitySelector item={rowData} />
          },
        },
        ...(hasTax && {
          tax: {
            width: 100,
            title: formatMessage(messages.tax),
            cellRenderer({ rowData }) {
              return rowData.tax ? (
                <TruncatedText
                  text={
                    <FormattedPrice
                      value={(rowData.tax * rowData.quantity) / 100}
                    />
                  }
                  {...getStrike(rowData)}
                />
              ) : (
                <>N/A</>
              )
            },
          },
        }),
        priceDefinition: {
          width: 120,
          title: formatMessage(messages.totalPrice),
          cellRenderer({ rowData }) {
            const discountedPrice = getDiscountedPrice(rowData, discount)

            return (
              discountedPrice && (
                <TruncatedText
                  text={<FormattedPrice value={discountedPrice / 100} />}
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
              <Tooltip label={formatMessage(messages.delete)}>
                <div>
                  <ButtonWithIcon
                    size="small"
                    icon={<IconDelete />}
                    variation="danger-tertiary"
                    onClick={() => {
                      removeItem({
                        id: rowData.id,
                        seller: rowData.seller ?? '1',
                      })
                    }}
                  />
                </div>
              </Tooltip>
            )
          },
        },
      },
    }),
    [
      orderForm,
      formatMessage,
      removeItem,
      isEditing,
      discount,
      getSellingPrice,
      getDiscountedPrice,
      isSalesUser,
      handlesNewPrice,
      hasTax,
    ]
  )
}
