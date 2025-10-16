import React, { useCallback, useState } from 'react'
import { useMutation, useQuery } from 'react-apollo'
import { useIntl } from 'react-intl'
import type {
  Mutation,
  MutationDeleteCartArgs,
  SavedCart,
} from 'ssesandbox04.checkout-b2b'
import { Item } from 'vtex.checkout-graphql'
import { FormattedPrice } from 'vtex.formatted-price'
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
import { useClearCart, useSavedCart } from '../hooks'
import { useOrderFormCustom } from '../hooks/useOrderFormCustom'
import { useToast } from '../hooks/useToast'
import type { GetSavedCartsQuery, TableSchema } from '../typings'
import { messages } from '../utils'
import { ActionCellRenderer } from './ActionCellRenderer'
import { CellWrapper } from './CellWrapper'
import ChildrenCartsColumn from './ChildrenCartsColumn'
import { SavedCartDiscountBadge } from './SavedCartDiscountBadge'
import { SavedCartStatusBadge } from './SavedCartStatusBadge'
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
  setOpen?: (value: boolean) => void
}

export function SavedCartsTable(props?: Props) {
  const showToast = useToast()
  const { formatMessage } = useIntl()
  const { setOrderForm } = useOrderFormCustom()
  const { selectedCart, setSelectedCart } = useCheckoutB2BContext()

  const { clearCart } = useClearCart({
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

        if (
          selectedCart.status === 'denied' ||
          selectedCart.status === 'pending'
        ) {
          clearCart().then((clearCartData) => {
            setOrderForm(clearCartData.data?.clearCart)
          })
        }
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

  const { loading: loadingApplySavedCart, handleUseSavedCart } = useSavedCart({
    onChangeItems: props?.onChangeItems,
  })

  const handleConfirm = (cart: SavedCart) => {
    handleUseSavedCart(cart).then(() => props?.setOpen?.(false))
  }

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
      status: {
        width: 130,
        title: 'Status',
        cellRenderer: function Column({ rowData }) {
          if (rowData.loading) return <Spinner size={16} />

          return (
            <CellWrapper isChildren={rowData.parentCartId}>
              <SavedCartStatusBadge status={rowData.status} />
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
      requestedDiscount: {
        width: 150,
        title: formatMessage(messages.savedCartsDiscount),
        cellRenderer: function Column({ rowData }) {
          if (rowData.loading) return <Spinner size={16} />

          return (
            <CellWrapper isChildren={rowData.parentCartId}>
              <SavedCartDiscountBadge discount={rowData.requestedDiscount} />
            </CellWrapper>
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
