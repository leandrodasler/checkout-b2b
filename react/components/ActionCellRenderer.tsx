import React from 'react'
import { useIntl } from 'react-intl'
import type { SavedCart } from 'ssesandbox04.checkout-b2b'
import { ButtonWithIcon, IconShoppingCart, Tooltip } from 'vtex.styleguide'

import { useCheckoutB2BContext } from '../CheckoutB2BContext'
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
  const { selectedCart } = useCheckoutB2BContext()

  return (
    <Tooltip label={formatMessage(messages.confirm)}>
      <div>
        <ButtonWithIcon
          size="small"
          variation="tertiary"
          icon={<IconShoppingCart />}
          onClick={() => handleConfirm(rowData.id)}
          isLoading={loading && selectedCart?.id === rowData.id}
        />
      </div>
    </Tooltip>
  )
}

ActionCellRenderer.displayName = 'ActionCellRenderer'
