import React, { useEffect, useState } from 'react'
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
  const [quantity, setQuantity] = useState(cart.updateQuantity)
  const labelSuffix = cart.updateQuantity ? ` (${quantity})` : ''
  const title = `${formatMessage(
    messages.savedCartsUpdateHistory
  )}${labelSuffix}`

  useEffect(() => {
    setQuantity(cart.updateQuantity)
  }, [cart.updateQuantity])

  return (
    <>
      <Tooltip label={title}>
        <div>
          <ButtonWithIcon
            size="small"
            variation="tertiary"
            icon={<IconUpdateHistory quantity={quantity} />}
            onClick={() => setOpen(true)}
            isLoading={loading}
          />
        </div>
      </Tooltip>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        centered
        title={title}
        showBottomBarBorder={false}
        container={modalContainer}
      >
        {open && (
          <SavedCartComments
            cart={cart}
            isModal={!!modalContainer}
            setQuantity={setQuantity}
          />
        )}
      </Modal>
    </>
  )
}
