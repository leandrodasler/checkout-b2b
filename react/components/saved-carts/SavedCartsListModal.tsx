import React, { useCallback } from 'react'
import { useIntl } from 'react-intl'
import { useRuntime } from 'vtex.render-runtime'
import { Button, EXPERIMENTAL_Modal as Modal } from 'vtex.styleguide'

import { messages } from '../../utils'
import { SavedCartsTable } from './SavedCartTable'

type Props = {
  open: boolean
  setOpen: (value: boolean) => void
  setOpenKanban: (value: boolean) => void
  onChangeItems: () => void
}

export function SavedCartsListModal({
  open,
  setOpen,
  setOpenKanban,
  onChangeItems,
}: Props) {
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
      size="extralarge"
      title={formatMessage(messages.savedCartsTitle)}
      bottomBar={
        <div className="flex flex-wrap">
          <Button
            variation="tertiary"
            onClick={() => {
              setOpen(false)
              setOpenKanban(true)
            }}
          >
            {formatMessage(messages.discountKanbanModal)}
          </Button>

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
        </div>
      }
      showBottomBarBorder={false}
    >
      <div className="t-small">
        <SavedCartsTable onChangeItems={onChangeItems} setOpen={setOpen} />
      </div>
    </Modal>
  )
}
