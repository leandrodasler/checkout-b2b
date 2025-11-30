import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useIntl } from 'react-intl'
import type { SavedCart } from 'ssesandbox04.checkout-b2b'
import { ButtonWithIcon, Tooltip } from 'vtex.styleguide'

import { messages } from '../../utils'
import { IconUpdateHistory } from './IconUpdateHistory'
import { SavedCartComments } from './SavedCartComments'

type Props = {
  cart: SavedCart
  modalContainer?: HTMLElement | null
  loading?: boolean
}

const SIDEBAR_HEADER_HEIGHT = 'calc(100vh - 64px)'
const SIDEBAR_Z_INDEX = 2147483647

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

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'

      return () => {
        document.body.style.overflow = ''
      }
    }

    return undefined
  }, [open])

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

      {open &&
        createPortal(
          <div
            className="fixed top-0 left-0 w-100 h-100"
            style={{ zIndex: SIDEBAR_Z_INDEX }}
          >
            <div
              role="button"
              tabIndex={0}
              className="absolute top-0 left-0 w-100 h-100 bg-black-50"
              aria-label="Close sidebar"
              onClick={() => setOpen(false)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setOpen(false)
                }
              }}
            />

            <div
              className="fixed top-0 right-0 h-100 bg-base shadow-5"
              style={{ width: '360px', maxWidth: '90vw' }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="saved-cart-update-history-title"
            >
              <div className="pa4 bb b--muted-4 flex justify-between items-center">
                <span className="b">
                  {formatMessage(messages.savedCartsUpdateHistory)}
                </span>
                <button
                  type="button"
                  className="bn bg-transparent pointer"
                  aria-label="close sidebar"
                  onClick={() => setOpen(false)}
                >
                  ×
                </button>
              </div>

              <div
                className="pa4 overflow-auto"
                style={{ maxHeight: SIDEBAR_HEADER_HEIGHT }}
              >
                <SavedCartComments
                  cart={cart}
                  isModal={!!modalContainer}
                  setQuantity={setQuantity}
                />
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  )
}
