import React from 'react'
import { useIntl } from 'react-intl'
import type { SavedCart } from 'ssesandbox04.checkout-b2b'
import { Button, Table } from 'vtex.styleguide'

import { messages } from '../utils'

interface SavedCartsTableProps {
  savedCarts: SavedCart[] | undefined
  handleConfirm: (id: string) => void
  handleSelectCart: (id: string) => void
  loadingApplySavedCart: boolean
}

export function SavedCartsTable({
  savedCarts,
  handleConfirm,
  handleSelectCart,
  loadingApplySavedCart,
}: SavedCartsTableProps) {
  const { formatMessage } = useIntl()

  const ActionCellRenderer = ({ rowData }: { rowData: SavedCart }) => (
    <Button
      size="small"
      onClick={() => handleConfirm(rowData.id)}
      isLoading={loadingApplySavedCart}
    >
      {formatMessage(messages.confirm)}
    </Button>
  )

  ActionCellRenderer.displayName = 'ActionCellRenderer'

  const tableSchema = {
    properties: {
      createdIn: {
        title: formatMessage(messages.createdIn),
        cellRenderer: ({ cellData }: { cellData: string }) =>
          new Date(cellData).toLocaleString(),
      },
      title: {
        title: formatMessage(messages.name),
      },
      totalValue: {
        title: formatMessage(messages.totalPrice),
        cellRenderer: ({ rowData }: { rowData: SavedCart }) => {
          const cartData = JSON.parse(rowData.data ?? '{}')

          return cartData?.value
            ? `R$ ${(cartData.value / 100).toFixed(2)}`
            : '-'
        },
      },
      totalItems: {
        title: formatMessage(messages.quantity),
        cellRenderer: ({ rowData }: { rowData: SavedCart }) => {
          const cartData = JSON.parse(rowData.data ?? '{}')

          return cartData?.items?.length ?? 0
        },
      },
      paymentMethod: {
        title: formatMessage(messages.paymentMethods),
        cellRenderer: ({ rowData }: { rowData: SavedCart }) => {
          const cartData = JSON.parse(rowData.data ?? '{}')
          const paymentSystemId =
            cartData?.paymentData?.payments?.[0]?.paymentSystem

          const paymentMethods = cartData?.paymentData?.paymentSystems
          const paymentMethodName = paymentMethods?.find(
            (method: { id: number }) =>
              String(method.id) === String(paymentSystemId)
          )?.name

          return paymentMethodName ?? '-'
        },
      },
      action: {
        title: ' ',
        cellRenderer: ActionCellRenderer,
      },
    },
  }

  return (
    <ReusableTable
      schema={tableSchema}
      items={savedCarts ?? []}
      onRowClick={({ rowData }: { rowData: SavedCart }) =>
        handleSelectCart(rowData.id)
      }
    />
  )
}

interface ReusableTableProps {
  schema: Record<string, unknown>
  items: SavedCart[]
  onRowClick: (data: { rowData: SavedCart }) => void
}

function ReusableTable({ schema, items, onRowClick }: ReusableTableProps) {
  return (
    <Table
      schema={schema}
      items={items}
      density="low"
      onRowClick={onRowClick}
    />
  )
}
