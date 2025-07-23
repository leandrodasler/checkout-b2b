import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useIntl } from 'react-intl'
import { FormattedPrice } from 'vtex.formatted-price'
import { OrderItems } from 'vtex.order-items'
import { ButtonWithIcon, IconDelete, Tooltip } from 'vtex.styleguide'

import { useOrderFormCustom, usePermissions, useTotalMargin } from '.'
import { useCheckoutB2BContext } from '../CheckoutB2BContext'
import { CellWrapper } from '../components/CellWrapper'
import ChildrenProductsColumn from '../components/ChildrenProductsColumn'
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

export function useTableSchema({
  expandedProducts,
  setExpandedProducts,
  isGrouping,
  isEditing,
  discount,
  onUpdatePrice,
}: {
  expandedProducts: string[]
  setExpandedProducts: React.Dispatch<React.SetStateAction<string[]>>
  isGrouping: boolean
  isEditing: boolean
  discount: number
  onUpdatePrice: (id: string, newPrice: number) => void
}): TableSchema<CustomItem> {
  const { hasMargin } = useTotalMargin()
  const { orderForm } = useOrderFormCustom()
  const { formatMessage } = useIntl()
  const { removeItem } = useOrderItems()
  const { canSeeMargin } = usePermissions()
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

  const makeSafeCell = <T,>(render: (rowData: T) => React.ReactNode) => ({
    rowData,
  }: {
    rowData: T
  }) => {
    const data = (rowData as unknown) as CustomItem

    return data?.__group ? '--' : render(rowData)
  }

  return useMemo(
    () => ({
      properties: {
        ...(isGrouping && {
          expand: {
            title: ' ',
            width: 10,
            cellRenderer({ rowData }: { rowData: CustomItem }) {
              return (
                <ChildrenProductsColumn
                  isParent={rowData.__group}
                  productId={rowData.productId ?? ''}
                  expandedProducts={expandedProducts}
                  setExpandedProducts={setExpandedProducts}
                />
              )
            },
          },
        }),
        refId: {
          title: formatMessage(messages.refId),
          width: 120,
          cellRenderer({ rowData }) {
            return (
              <TruncatedText
                text={rowData.__group ? ' ' : rowData.refId}
                {...getStrike(rowData)}
              />
            )
          },
        },
        skuName: {
          minWidth: 250,
          title: formatMessage(messages.name),
          cellRenderer({ rowData }) {
            const { name, skuName, __group: isParent } = rowData
            const displayName = isParent
              ? name
              : skuName
              ? normalizeString(skuName).includes(normalizeString(name))
                ? skuName
                : `${name} - ${skuName}`
              : name

            return (
              <TruncatedText
                label={displayName}
                text={
                  <CellWrapper isChildren={isParent}>{displayName}</CellWrapper>
                }
                {...getStrike(rowData)}
              />
            )
          },
        },
        additionalInfo: {
          width: 120,
          title: formatMessage(messages.brand),
          cellRenderer({ rowData }) {
            const brandName = rowData.additionalInfo?.brandName ?? 'N/A'

            return (
              <TruncatedText
                label={brandName}
                text={
                  <CellWrapper isChildren={rowData.__group}>
                    {brandName}
                  </CellWrapper>
                }
                {...getStrike(rowData)}
              />
            )
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
                text={
                  <CellWrapper isChildren={rowData.__group}>
                    {leadCategory}
                  </CellWrapper>
                }
                {...getStrike(rowData)}
              />
            )
          },
        },
        seller: {
          width: 150,
          title: formatMessage(messages.seller),
          cellRenderer: makeSafeCell((rowData) => {
            const seller = orderForm.sellers?.find(
              (s) => rowData.seller === s?.id
            )

            const sellerName = seller?.name ?? rowData.seller ?? 'N/A'

            return <TruncatedText text={sellerName} {...getStrike(rowData)} />
          }),
        },
        sellingPrice: {
          width: 150,
          title: formatMessage(messages.price),
          cellRenderer: makeSafeCell((rowData) => {
            return (
              <ManualPrice
                rowData={rowData}
                isEditing={isEditing}
                sliderValue={discount}
                onUpdatePrice={handlesNewPrice}
              />
            )
          }),
        },
        ...(hasMargin &&
          canSeeMargin && {
            listPrice: {
              width: 100,
              title: formatMessage(messages.margin),
              cellRenderer: makeSafeCell((rowData) => {
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
              }),
            },
          }),
        quantity: {
          width: 110,
          title: <div className="tc">{formatMessage(messages.quantity)}</div>,
          cellRenderer({ rowData }) {
            return (
              <QuantitySelector item={rowData} disabled={rowData.__group} />
            )
          },
        },
        ...(hasTax && {
          tax: {
            width: 100,
            title: formatMessage(messages.tax),
            cellRenderer: makeSafeCell((rowData) => {
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
            }),
          },
        }),

        priceDefinition: {
          width: 120,
          title: formatMessage(messages.totalPrice),
          cellRenderer({ rowData }) {
            const discountedPrice =
              (rowData.__group
                ? rowData.price ?? 0
                : getDiscountedPrice(rowData, discount)) / 100

            return (
              discountedPrice && (
                <TruncatedText
                  text={<FormattedPrice value={discountedPrice} />}
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
              !rowData.__group && (
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
            )
          },
        },
      },
    }),
    [
      isGrouping,
      formatMessage,
      hasMargin,
      canSeeMargin,
      hasTax,
      expandedProducts,
      setExpandedProducts,
      orderForm.sellers,
      isEditing,
      discount,
      handlesNewPrice,
      getSellingPrice,
      getDiscountedPrice,
      removeItem,
    ]
  )
}
