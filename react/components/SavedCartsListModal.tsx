import React, { useCallback } from 'react'
import { useIntl } from 'react-intl'
import { useRuntime } from 'vtex.render-runtime'
import { Button, EXPERIMENTAL_Modal as Modal } from 'vtex.styleguide'

import { messages } from '../utils'
import { SavedCartsTable } from './SavedCartTable'

type Props = {
  open: boolean
  setOpen: (value: boolean) => void
  onChangeItems: () => void
}

export function SavedCartsListModal({ open, setOpen, onChangeItems }: Props) {
  const { formatMessage } = useIntl()
  const { navigate, query } = useRuntime()

  const handleCloseModal = useCallback(() => {
    setOpen(false)
  }, [setOpen])

  return (
    <Modal
      isOpen={open}
      onClose={handleCloseModal}
      centered
      size="large"
      title={formatMessage(messages.savedCartsTitle)}
      bottomBar={
        <Button
          variation="tertiary"
          onClick={() =>
            navigate({
              page: 'store.b2b-saved-carts',
              fallbackToWindowLocation: true,
              query: new URLSearchParams(query).toString(),
            })
          }
        >
          {formatMessage(messages.savedCartsFullScreen)}
        </Button>
      }
      showBottomBarBorder={false}
    >
      <div className="t-small">
        <SavedCartsTable onChangeItems={onChangeItems} />
      </div>
    </Modal>
  )
}
