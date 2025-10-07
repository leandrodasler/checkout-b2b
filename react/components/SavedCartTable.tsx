import React, { useCallback, useMemo, useState } from 'react'
import { ExecutionResult, useMutation, useQuery } from 'react-apollo'
import { useIntl } from 'react-intl'
import type {
  Mutation,
  MutationDeleteCartArgs,
  MutationUpdatePricesArgs,
  SavedCart,
} from 'ssesandbox04.checkout-b2b'
import { CustomData, Item } from 'vtex.checkout-graphql'
import type {
  SelectDeliveryOptionMutation,
  SelectDeliveryOptionMutationVariables,
} from 'vtex.checkout-resources'
import { MutationSelectDeliveryOption } from 'vtex.checkout-resources'
import { FormattedPrice } from 'vtex.formatted-price'
import { useRuntime } from 'vtex.render-runtime'
import type {
  LogisticsInfo,
  Mutation as MutationCheckout,
  MutationSetOrderFormCustomDataArgs,
} from 'vtex.store-graphql'
import {
  ButtonWithIcon,
  IconDelete,
  Spinner,
  Table,
  Tooltip,
} from 'vtex.styleguide'

import { useCheckoutB2BContext } from '../CheckoutB2BContext'
import DELETE_SAVED_CART from '../graphql/deleteCart.graphql'
import GET_SAVED_CARTS from '../graphql/getSavedCarts.graphql'
import SET_ORDER_FORM_CUSTOM_DATA from '../graphql/setOrderFormCustomData.graphql'
import MUTATION_UPDATE_PRICES from '../graphql/updatePrices.graphql'
import { useAddItems, useClearCart, useUpdatePayment } from '../hooks'
import { useOrderFormCustom } from '../hooks/useOrderFormCustom'
import { useToast } from '../hooks/useToast'
import type {
  CompleteOrderForm,
  GetSavedCartsQuery,
  TableSchema,
} from '../typings'
import { messages } from '../utils'
import { ActionCellRenderer } from './ActionCellRenderer'
import { CellWrapper } from './CellWrapper'
import ChildrenCartsColumn from './ChildrenCartsColumn'
import { TruncatedText } from './TruncatedText'

type SavedCartRow = SavedCart &
  Partial<{
    expand: unknown
    totalValue: unknown
    totalItems: unknown
    paymentMethod: unknown
    action: unknown
    loading: boolean
  }>

type MutationSetOrderFormCustomData = Pick<
  MutationCheckout,
  'setOrderFormCustomData'
>

type MutationUpdatePrices = Pick<Mutation, 'updatePrices'>

function getEmptySimpleCart(parentCartId: string): SavedCartRow {
  return {
    id: '',
    parentCartId,
    createdIn: '',
    title: '',
    lastInteractionIn: '',
    email: '',
    orderFormId: '',
    organizationId: '',
    costCenterId: '',
    data: '',
    totalValue: '',
    totalItems: '',
    paymentMethod: '',
    action: '',
    loading: true,
    status: 'open',
  }
}

type Props = {
  onChangeItems?: () => void
}

export function SavedCartsTable(props?: Props) {
  const showToast = useToast()
  const { formatMessage } = useIntl()
  const { setQuery, page, navigate, query } = useRuntime()
  const { orderForm, setOrderForm } = useOrderFormCustom()
  const {
    setPending,
    selectedCart,
    setSelectedCart,
    setOpenSavedCartModal,
  } = useCheckoutB2BContext()

  const selectedCartData = JSON.parse(selectedCart?.data ?? '{}')
  const { clearCart, isLoading: loadingClearCart } = useClearCart({
    updateOrderForm: false,
    onChangeItems: props?.onChangeItems,
  })

  const [deletingCartId, setDeletingCartId] = useState('')
  const [expandedCarts, setExpandedCarts] = React.useState<string[]>([])
  const [childrenCarts, setChildrenCarts] = React.useState<
    Record<string, SavedCart[]>
  >({})

  const { data, loading, updateQuery } = useQuery<GetSavedCartsQuery>(
    GET_SAVED_CARTS,
    {
      ssr: false,
      fetchPolicy: 'network-only',
      onError: showToast,
    }
  )

  const [deleteCartMutation, { loading: loadingDeleteCart }] = useMutation<
    Pick<Mutation, 'deleteCart'>,
    MutationDeleteCartArgs
  >(DELETE_SAVED_CART, {
    onError: showToast,
    onCompleted({ deleteCart }) {
      if (!deleteCart) return

      if (
        selectedCart?.id === deleteCart ||
        selectedCart?.parentCartId === deleteCart
      ) {
        setSelectedCart(null)
      }

      const deletedChild: Record<string, boolean> = { '': false }

      Object.keys(childrenCarts).forEach((parentCartId) => {
        if (childrenCarts[parentCartId].some((c) => c.id === deleteCart)) {
          deletedChild[parentCartId] = true
          setChildrenCarts({
            ...childrenCarts,
            [parentCartId]: childrenCarts[parentCartId].filter(
              (c) => c.id !== deleteCart
            ),
          })
        }
      })

      updateQuery((prev) => ({
        getSavedCarts: prev.getSavedCarts
          .filter(
            (cart: SavedCart) =>
              cart.id !== deleteCart && cart.parentCartId !== deleteCart
          )
          .map((cart: SavedCart) => ({
            ...cart,
            childrenQuantity: deletedChild[cart.id]
              ? (cart.childrenQuantity ?? 1) - 1
              : cart.childrenQuantity,
          })),
      }))
    },
  })

  const [addItemsMutation, { loading: loadingAddItemsToCart }] = useAddItems({
    completeData: {
      customData: selectedCartData.customData,
      paymentData: selectedCartData.paymentData,
      sellers: selectedCartData.sellers,
    },
  })

  const [
    setManualPriceMutation,
    { loading: loadingSetManualPrice },
  ] = useMutation<MutationUpdatePrices, MutationUpdatePricesArgs>(
    MUTATION_UPDATE_PRICES,
    {
      onCompleted: ({ updatePrices }) => {
        setOrderForm({
          ...orderForm,
          ...updatePrices,
          customData: selectedCartData.customData,
          paymentData: selectedCartData.paymentData,
        } as CompleteOrderForm)
      },
      onError: showToast,
    }
  )

  const [selectDeliveryOption] = useMutation<
    SelectDeliveryOptionMutation,
    SelectDeliveryOptionMutationVariables
  >(MutationSelectDeliveryOption, {
    onCompleted({ selectDeliveryOption: updatedOrderForm }) {
      setOrderForm({
        ...orderForm,
        ...updatedOrderForm,
        customData: selectedCartData.customData,
        paymentData: selectedCartData.paymentData,
      } as CompleteOrderForm)
    },
    onError: showToast,
  })

  const { updatePayment, loading: loadingUpdatePayment } = useUpdatePayment()

  const [setOrderFormCustomData] = useMutation<
    MutationSetOrderFormCustomData,
    MutationSetOrderFormCustomDataArgs
  >(SET_ORDER_FORM_CUSTOM_DATA)

  const loadingApplySavedCart = useMemo(
    () =>
      loadingClearCart ||
      loadingAddItemsToCart ||
      loadingSetManualPrice ||
      loadingUpdatePayment,
    [
      loadingAddItemsToCart,
      loadingClearCart,
      loadingSetManualPrice,
      loadingUpdatePayment,
    ]
  )

  const mainCarts = data?.getSavedCarts ?? []

  const savedCarts: SavedCartRow[] = []

  for (const cart of mainCarts) {
    savedCarts.push(cart)

    if (cart.childrenQuantity && expandedCarts.includes(cart.id)) {
      if (childrenCarts[cart.id]) {
        savedCarts.push(...childrenCarts[cart.id])
      } else {
        for (let i = 0; i < (cart.childrenQuantity ?? 1); i++) {
          savedCarts.push(getEmptySimpleCart(cart.id))
        }
      }
    }
  }

  const handleConfirm = (cart: SavedCart) => {
    setSelectedCart(cart)
    setQuery({ savedCart: cart.id })

    const { items, paymentData, shippingData, customData } = JSON.parse(
      cart.data ?? '{}'
    )

    const { payments } = paymentData
    const { logisticsInfo } = shippingData ?? {}
    const selectedDeliveryOption = (logisticsInfo as LogisticsInfo[]).find(
      (logisticsInfoItem) => !!logisticsInfoItem.selectedSla
    )?.selectedSla

    setPending(true)

    try {
      clearCart(undefined, {
        onSuccess: async () => {
          await addItemsMutation({
            variables: {
              orderItems: items?.map((item: Item) => ({
                id: +item.id,
                quantity: item.quantity,
                seller: item.seller,
              })),
            },
          })

          if (payments?.[0]) {
            await updatePayment({
              variables: {
                paymentData: {
                  payments: [
                    {
                      paymentSystem: payments[0].paymentSystem,
                      referenceValue: payments[0].referenceValue,
                      installmentsInterestRate:
                        payments[0].merchantSellerPayments?.[0]?.interestRate ??
                        0,
                      installments: payments[0].installment ?? 1,
                      value: payments[0].value,
                    },
                  ],
                },
              },
            })
          }

          if (selectedDeliveryOption) {
            await selectDeliveryOption({
              variables: {
                deliveryOptionId: selectedDeliveryOption,
              },
            })
          }

          if (customData?.customApps?.length) {
            const { customApps } = customData as {
              customApps: NonNullable<CustomData>['customApps']
            }

            const setCustomDataPromises: Array<
              Promise<ExecutionResult<MutationSetOrderFormCustomData>>
            > = []

            customApps.forEach((app) => {
              Object.entries(app.fields).forEach(([field, value]) => {
                setCustomDataPromises.push(
                  setOrderFormCustomData({
                    variables: {
                      appId: app.id,
                      field,
                      value: value as string,
                    },
                  })
                )
              })
            })

            await Promise.all(setCustomDataPromises)
          }

          const manualPriceItems = items
            ?.map((item: Item, index: number) => {
              if (item.manualPrice) {
                return {
                  index,
                  price: item.manualPrice ?? item.sellingPrice ?? 0,
                }
              }

              return null
            })
            .filter(Boolean)

          if (manualPriceItems?.length) {
            await setManualPriceMutation({
              variables: { items: manualPriceItems },
            })
          }

          setPending(false)
          setOpenSavedCartModal(false)

          if (page !== 'store.checkout-b2b') {
            navigate({
              page: 'store.checkout-b2b',
              fallbackToWindowLocation: true,
              query: new URLSearchParams({
                ...query,
                savedCart: cart.id,
              }).toString(),
            })
          }
        },
      })
    } catch (error) {
      setPending(false)
      showToast({ message: error.message })
    }
  }

  const parseCartData = useCallback((savedCartData: string) => {
    try {
      return JSON.parse(savedCartData)
    } catch {
      return {}
    }
  }, [])

  const renderCartValue = useCallback(
    (rowData: SavedCart) => {
      const cartData = parseCartData(rowData.data ?? '{}')

      return cartData?.value ? (
        <FormattedPrice value={cartData.value / 100} />
      ) : (
        <TruncatedText text="-" />
      )
    },
    [parseCartData]
  )

  const tableSchema: TableSchema<SavedCartRow> = {
    properties: {
      expand: {
        width: 8,
        title: ' ',
        cellRenderer: function Column({ rowData }) {
          return (
            <ChildrenCartsColumn
              cart={rowData}
              childrenCarts={childrenCarts}
              setChildrenCarts={setChildrenCarts}
              expandedCarts={expandedCarts}
              setExpandedCarts={setExpandedCarts}
            />
          )
        },
      },

      createdIn: {
        width: 100,
        title: formatMessage(messages.createdIn),
        cellRenderer: function Column({ rowData }) {
          if (rowData.loading) return <Spinner size={16} />

          return (
            <CellWrapper isChildren={rowData.parentCartId}>
              <Tooltip label={new Date(rowData.createdIn).toLocaleString()}>
                <span className={rowData.parentCartId ? '' : ''}>
                  {new Date(rowData.createdIn).toLocaleDateString()}
                </span>
              </Tooltip>
            </CellWrapper>
          )
        },
      },
      title: {
        title: formatMessage(messages.name),
        cellRenderer: function Column({ rowData }) {
          if (rowData.loading) return <Spinner size={16} />

          return (
            <TruncatedText
              label={rowData.title}
              text={
                <CellWrapper isChildren={rowData.parentCartId}>
                  {rowData.title}
                </CellWrapper>
              }
            />
          )
        },
      },
      totalValue: {
        width: 120,
        title: formatMessage(messages.totalPrice),
        cellRenderer: function Column({ rowData }) {
          if (rowData.loading) return <Spinner size={16} />

          return (
            <CellWrapper isChildren={rowData.parentCartId}>
              {renderCartValue(rowData)}
            </CellWrapper>
          )
        },
      },
      totalItems: {
        width: 55,
        title: formatMessage(messages.items),
        cellRenderer: function Column({ rowData }) {
          if (rowData.loading) return <Spinner size={16} />

          const cartData = parseCartData(rowData.data ?? '{}')

          return (
            <CellWrapper isChildren={rowData.parentCartId}>
              {cartData?.items?.reduce(
                (acc: number, item: Item) => acc + item.quantity,
                0
              )}
            </CellWrapper>
          )
        },
      },
      paymentMethod: {
        title: formatMessage(messages.paymentMethods),
        cellRenderer: function Column({ rowData }) {
          if (rowData.loading) return <Spinner size={16} />

          const cartData = parseCartData(rowData.data ?? '{}')
          const paymentSystemId =
            cartData?.paymentData?.payments?.[0]?.paymentSystem

          const paymentMethods = cartData?.paymentData?.paymentSystems
          const paymentMethodName = paymentMethods?.find(
            (method: { id: number }) =>
              String(method.id) === String(paymentSystemId)
          )?.name

          return (
            <TruncatedText
              label={paymentMethodName}
              text={
                <CellWrapper isChildren={rowData.parentCartId}>
                  {paymentMethodName}
                </CellWrapper>
              }
            />
          )
        },
      },
      action: {
        title: ' ',
        width: 50,
        cellRenderer: function Column({ rowData }) {
          return (
            <ActionCellRenderer
              rowData={rowData}
              handleConfirm={handleConfirm}
              loading={
                rowData.loading ??
                (loadingApplySavedCart && rowData.id === selectedCart?.id)
              }
              disabled={
                rowData.loading ??
                (loadingDeleteCart ||
                  loadingApplySavedCart ||
                  selectedCart?.id === rowData.id)
              }
            />
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
                  disabled={
                    rowData.loading ??
                    (loadingApplySavedCart || loadingDeleteCart)
                  }
                  isLoading={
                    rowData.loading ??
                    (deletingCartId === rowData.id && loadingDeleteCart)
                  }
                  size="small"
                  icon={<IconDelete />}
                  variation="danger-tertiary"
                  onClick={() => {
                    setDeletingCartId(rowData.id)
                    deleteCartMutation({ variables: { id: rowData.id } })
                  }}
                />
              </div>
            </Tooltip>
          )
        },
      },
    },
  }

  return (
    <Table
      emptyStateLabel={formatMessage(messages.savedCartsUseEmpty)}
      schema={tableSchema}
      fullWidth
      items={savedCarts ?? []}
      density="high"
      loading={loading}
    />
  )
}
