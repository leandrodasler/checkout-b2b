import React from 'react'
import { useIntl } from 'react-intl'
import type { SavedCart } from 'ssesandbox04.checkout-b2b'
import { ButtonWithIcon, IconShoppingCart, Tooltip } from 'vtex.styleguide'

import { useCheckoutB2BContext } from '../CheckoutB2BContext'
import { messages } from '../utils'

interface ActionCellRendererProps {
  rowData: SavedCart
  handleConfirm: (cart: SavedCart) => void
  loading: boolean
  disabled: boolean
}

export const ActionCellRenderer = ({
  rowData,
  handleConfirm,
  loading,
  disabled,
}: ActionCellRendererProps) => {
  const { formatMessage } = useIntl()
  const { selectedCart } = useCheckoutB2BContext()

  const tooltipLabel =
    selectedCart?.id === rowData.id
      ? formatMessage(messages.savedCartsInUseLabel)
      : formatMessage(messages.savedCartsSelectLabel)

  return (
    <Tooltip label={tooltipLabel}>
      <div>
        <ButtonWithIcon
          size="small"
          variation="tertiary"
          icon={<IconShoppingCart />}
          onClick={() => handleConfirm(rowData)}
          disabled={disabled}
          isLoading={loading}
        />
      </div>
    </Tooltip>
  )
}

ActionCellRenderer.displayName = 'ActionCellRenderer'
