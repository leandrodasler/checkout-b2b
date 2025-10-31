import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import type { SavedCart } from 'ssesandbox04.checkout-b2b'
import { ButtonWithIcon, Modal, Tooltip } from 'vtex.styleguide'

import { messages } from '../utils'
import { IconUpdateHistory } from './IconUpdateHistory'
import { SavedCartComments } from './SavedCartComments'

type Props = {
  cart: SavedCart
  modalContainer?: HTMLElement | null
  loading?: boolean
}

export function SavedCartCommentBadge({
  cart,
  modalContainer,
  loading,
}: Props) {
  const { formatMessage } = useIntl()
  const [open, setOpen] = useState(false)
  const labelSuffix = cart.updateQuantity ? `: ${cart.updateQuantity}` : ''
  const tooltipLabel = `${formatMessage(
    messages.savedCartsUpdateHistory
  )}${labelSuffix}`

  return (
    <>
      <Tooltip label={tooltipLabel}>
        <div>
          <ButtonWithIcon
            size="small"
            variation="tertiary"
            icon={<IconUpdateHistory quantity={cart.updateQuantity} />}
            onClick={() => setOpen(true)}
            isLoading={loading}
          />
        </div>
      </Tooltip>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        centered
        title={formatMessage(messages.savedCartsUpdateHistory)}
        showBottomBarBorder={false}
        container={modalContainer}
      >
        {open && <SavedCartComments cart={cart} isModal={!!modalContainer} />}
      </Modal>
    </>
  )
}
