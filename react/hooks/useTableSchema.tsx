import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import { FormattedPrice } from 'vtex.formatted-price'
import { ButtonWithIcon, IconDelete, Tooltip } from 'vtex.styleguide'

import {
  useOrderFormCustom,
  usePermissions,
  useTotalMargin,
  useUpdateItemsQuantity,
} from '.'
import { useCheckoutB2BContext } from '../CheckoutB2BContext'
import { CellWrapper } from '../components/CellWrapper'
import ChildrenProductsColumn from '../components/ChildrenProductsColumn'
import ManualPrice from '../components/ManualPrice'
import { MarginProductPrice } from '../components/MarginProductPrice'
import { QuantitySelector } from '../components/QuantitySelector'
import { TruncatedText } from '../components/TruncatedText'
import type { CustomItem, TableSchema } from '../typings'
import { isWithoutStock, messages, normalizeString } from '../utils'

function getStrike(item: CustomItem, isRemoving?: boolean) {
  return { strike: isWithoutStock(item) || isRemoving }
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
  const [updateQuantity, { loading: removeLoading }] = useUpdateItemsQuantity()
  const { canSeeMargin } = usePermissions()
  const lastDeletedIndexRef = useRef<number | null>(null)
  const {
    getSellingPrice,
    getDiscountedPrice,
    setSubtotal,
    setListedPrice,
  } = useCheckoutB2BContext()

  const prevHasMarginRef = useRef(hasMargin)

  const isRemoving = useCallback(
    (index: number) => removeLoading && lastDeletedIndexRef.current === index,
    [removeLoading]
  )

  useEffect(() => {
    if (!hasMargin) return
    prevHasMarginRef.current = hasMargin
  }, [hasMargin])

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

  return {
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
      ...((orderForm.shippingData?.selectedAddresses.length ?? 0) > 1 && {
        costCenter: {
          width: 120,
          title: formatMessage(messages.costCenterSingleLabel),
          cellRenderer: makeSafeCell((rowData) => {
            return (
              <div
                className="pa1 br1 w-100 tc b"
                style={{
                  backgroundColor: rowData.costCenter?.color ?? 'transparent',
                }}
              >
                <TruncatedText
                  text={rowData.costCenter?.costCenterName}
                  {...getStrike(rowData, isRemoving(rowData.itemIndex))}
                />
              </div>
            )
          }),
        },
      }),
      refId: {
        title: formatMessage(messages.refId),
        width: 120,
        cellRenderer: makeSafeCell((rowData) => {
          return (
            <TruncatedText
              text={rowData.__group ? ' ' : rowData.refId}
              {...getStrike(rowData, isRemoving(rowData.itemIndex))}
            />
          )
        }),
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
              : normalizeString(name).includes(normalizeString(skuName))
              ? name
              : `${name} - ${skuName}`
            : name

          return (
            <TruncatedText
              label={displayName}
              text={
                <CellWrapper isChildren={isParent}>{displayName}</CellWrapper>
              }
              {...getStrike(rowData, isRemoving(rowData.itemIndex))}
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
              {...getStrike(rowData, isRemoving(rowData.itemIndex))}
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
              {...getStrike(rowData, isRemoving(rowData.itemIndex))}
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

          return (
            <TruncatedText
              text={sellerName}
              {...getStrike(rowData, isRemoving(rowData.itemIndex))}
            />
          )
        }),
      },
      sellingPrice: {
        width: 150,
        title: formatMessage(messages.price),
        cellRenderer: makeSafeCell((rowData) => {
          return (
            <TruncatedText
              text={
                <ManualPrice
                  rowData={rowData}
                  isEditing={isEditing}
                  sliderValue={discount}
                  onUpdatePrice={handlesNewPrice}
                />
              }
              {...getStrike(rowData, isRemoving(rowData.itemIndex))}
            />
          )
        }),
      },
      ...((hasMargin || prevHasMarginRef) &&
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
                  {...getStrike(rowData, isRemoving(rowData.itemIndex))}
                />
              )
            }),
          },
        }),
      quantity: {
        width: 110,
        title: <div className="tc">{formatMessage(messages.quantity)}</div>,
        cellRenderer({ rowData }) {
          const parentItem = orderForm.items.find(
            (i) => i.id === rowData.parentItemId
          )

          return (
            <QuantitySelector
              item={{
                ...rowData,
                quantity: rowData.quantity * (parentItem?.quantity ?? 1),
              }}
              disabled={
                (rowData.__group ?? false) ||
                (rowData.__component ?? false) ||
                isRemoving(rowData.itemIndex)
              }
            />
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
                {...getStrike(rowData, isRemoving(rowData.itemIndex))}
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
                {...getStrike(rowData, isRemoving(rowData.itemIndex))}
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
                    isLoading={isRemoving(rowData.itemIndex)}
                    disabled={removeLoading}
                    size="small"
                    icon={<IconDelete />}
                    variation="danger-tertiary"
                    onClick={() => {
                      lastDeletedIndexRef.current = rowData.itemIndex

                      updateQuantity({
                        variables: {
                          orderItems: [
                            { index: rowData.itemIndex, quantity: 0 },
                          ],
                        },
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
  }
}
