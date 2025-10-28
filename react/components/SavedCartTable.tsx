import React, { useCallback, useState } from 'react'
import { useQuery } from 'react-apollo'
import { useIntl } from 'react-intl'
import type { SavedCart } from 'ssesandbox04.checkout-b2b'
import { Item } from 'vtex.checkout-graphql'
import { FormattedPrice } from 'vtex.formatted-price'
import { useRuntime } from 'vtex.render-runtime'
import {
  ButtonWithIcon,
  IconDelete,
  Spinner,
  Table,
  Tag,
  Tooltip,
} from 'vtex.styleguide'

import { useCheckoutB2BContext } from '../CheckoutB2BContext'
import GET_SAVED_CARTS from '../graphql/getSavedCarts.graphql'
import { useDeleteSavedCart, useSavedCart } from '../hooks'
import { useToast } from '../hooks/useToast'
import type { GetSavedCartsQuery, TableSchema } from '../typings'
import { messages } from '../utils'
import { ActionCellRenderer } from './ActionCellRenderer'
import { CellWrapper, SelectedWrapper } from './CellWrapper'
import ChildrenCartsColumn from './ChildrenCartsColumn'
import { IconUpdateHistory } from './IconUpdateHistory'
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
    comments: unknown
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
  const { locale } = useRuntime().culture
  const { formatMessage } = useIntl()
  const { selectedCart } = useCheckoutB2BContext()
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

  const [
    deleteCartMutation,
    { loading: loadingDeleteCart },
  ] = useDeleteSavedCart({
    childrenCarts,
    setChildrenCarts,
    onChangeItems: props?.onChangeItems,
    updateQuery,
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
            <SelectedWrapper isSelected={selectedCart?.id === rowData.id}>
              <ChildrenCartsColumn
                cart={rowData}
                childrenCarts={childrenCarts}
                setChildrenCarts={setChildrenCarts}
                expandedCarts={expandedCarts}
                setExpandedCarts={setExpandedCarts}
              />
            </SelectedWrapper>
          )
        },
      },

      createdIn: {
        width: 100,
        title: formatMessage(messages.createdIn),
        cellRenderer: function Column({ rowData }) {
          if (rowData.loading) return <Spinner size={16} />

          return (
            <SelectedWrapper isSelected={selectedCart?.id === rowData.id}>
              <CellWrapper isChildren={rowData.parentCartId}>
                <Tooltip
                  label={new Date(rowData.createdIn).toLocaleString(locale)}
                >
                  <span className={rowData.parentCartId ? '' : ''}>
                    {new Date(rowData.createdIn).toLocaleDateString(locale)}
                  </span>
                </Tooltip>
              </CellWrapper>
            </SelectedWrapper>
          )
        },
      },
      status: {
        width: 130,
        title: 'Status',
        cellRenderer: function Column({ rowData }) {
          if (rowData.loading) return <Spinner size={16} />

          return (
            <SelectedWrapper isSelected={selectedCart?.id === rowData.id}>
              <CellWrapper isChildren={rowData.parentCartId}>
                <SavedCartStatusBadge status={rowData.status} />
              </CellWrapper>
            </SelectedWrapper>
          )
        },
      },
      title: {
        title: formatMessage(messages.name),
        cellRenderer: function Column({ rowData }) {
          if (rowData.loading) return <Spinner size={16} />

          return (
            <SelectedWrapper isSelected={selectedCart?.id === rowData.id}>
              <TruncatedText
                label={rowData.title}
                text={
                  <CellWrapper isChildren={rowData.parentCartId}>
                    {rowData.title}
                  </CellWrapper>
                }
              />
            </SelectedWrapper>
          )
        },
      },
      email: {
        title: formatMessage(messages.shareCartUser),
        cellRenderer: function Column({ rowData }) {
          if (rowData.loading) return <Spinner size={16} />

          return (
            <SelectedWrapper isSelected={selectedCart?.id === rowData.id}>
              <TruncatedText
                label={rowData.email}
                text={
                  <CellWrapper isChildren={rowData.parentCartId}>
                    {rowData.email}
                  </CellWrapper>
                }
              />
            </SelectedWrapper>
          )
        },
      },
      roleId: {
        title: ' ',
        width: 155,
        cellRenderer: function Column({ rowData }) {
          if (rowData.loading) return <Spinner size={16} />

          return (
            <SelectedWrapper isSelected={selectedCart?.id === rowData.id}>
              <CellWrapper isChildren={rowData.parentCartId}>
                {rowData.roleId ? (
                  <Tag size="small" variation="low">
                    {rowData.roleId}
                  </Tag>
                ) : (
                  '---'
                )}
              </CellWrapper>
            </SelectedWrapper>
          )
        },
      },
      requestedDiscount: {
        width: 150,
        title: formatMessage(messages.savedCartsDiscount),
        cellRenderer: function Column({ rowData }) {
          if (rowData.loading) return <Spinner size={16} />

          return (
            <SelectedWrapper isSelected={selectedCart?.id === rowData.id}>
              <CellWrapper isChildren={rowData.parentCartId}>
                {rowData.requestedDiscount ? (
                  <SavedCartDiscountBadge
                    discount={rowData.requestedDiscount}
                  />
                ) : (
                  'N/A'
                )}
              </CellWrapper>
            </SelectedWrapper>
          )
        },
      },
      totalValue: {
        width: 120,
        title: formatMessage(messages.totalPrice),
        cellRenderer: function Column({ rowData }) {
          if (rowData.loading) return <Spinner size={16} />

          return (
            <SelectedWrapper isSelected={selectedCart?.id === rowData.id}>
              <CellWrapper isChildren={rowData.parentCartId}>
                {renderCartValue(rowData)}
              </CellWrapper>
            </SelectedWrapper>
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
            <SelectedWrapper isSelected={selectedCart?.id === rowData.id}>
              <CellWrapper isChildren={rowData.parentCartId}>
                {cartData?.items?.reduce(
                  (acc: number, item: Item) => acc + item.quantity,
                  0
                )}
              </CellWrapper>
            </SelectedWrapper>
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
            <SelectedWrapper isSelected={selectedCart?.id === rowData.id}>
              <TruncatedText
                label={paymentMethodName}
                text={
                  <CellWrapper isChildren={rowData.parentCartId}>
                    {paymentMethodName}
                  </CellWrapper>
                }
              />
            </SelectedWrapper>
          )
        },
      },
      comments: {
        title: ' ',
        width: 50,
        cellRenderer: function Column({ rowData }) {
          return (
            <SelectedWrapper isSelected={selectedCart?.id === rowData.id}>
              <Tooltip label={formatMessage(messages.savedCartsUpdateHistory)}>
                <div>
                  <ButtonWithIcon
                    size="small"
                    variation="tertiary"
                    icon={<IconUpdateHistory />}
                    onClick={() => {} /* TODO */}
                    isLoading={false /* TODO */}
                    disabled={false /* TODO */}
                    style={{ padding: 0 }}
                  />
                </div>
              </Tooltip>
            </SelectedWrapper>
          )
        },
      },
      action: {
        title: ' ',
        width: 50,
        cellRenderer: function Column({ rowData }) {
          return (
            <SelectedWrapper isSelected={selectedCart?.id === rowData.id}>
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
            </SelectedWrapper>
          )
        },
      },
      id: {
        width: 50,
        title: ' ',
        cellRenderer({ rowData }) {
          return (
            <SelectedWrapper isSelected={selectedCart?.id === rowData.id}>
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
            </SelectedWrapper>
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
      onRowClick={() => {}}
    />
  )
}
