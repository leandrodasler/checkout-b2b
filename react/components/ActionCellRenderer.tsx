import React from 'react'
import { useIntl } from 'react-intl'
import type { SavedCart } from 'ssesandbox04.checkout-b2b'
import { Button } from 'vtex.styleguide'

import { messages } from '../utils'

interface ActionCellRendererProps {
  rowData: SavedCart
  handleConfirm: (id: string) => void
  loading: boolean
}

export const ActionCellRenderer = ({
  rowData,
  handleConfirm,
  loading,
}: ActionCellRendererProps) => {
  const { formatMessage } = useIntl()

  return (
    <Button
      size="small"
      onClick={() => handleConfirm(rowData.id)}
      isLoading={loading}
    >
      {formatMessage(messages.confirm)}
    </Button>
  )
}

ActionCellRenderer.displayName = 'ActionCellRenderer'
