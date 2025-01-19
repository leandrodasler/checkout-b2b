import React, { useCallback } from 'react'
import { useIntl } from 'react-intl'
import { EXPERIMENTAL_Modal as Modal } from 'vtex.styleguide'

import { messages } from '../utils'
import { SavedCartsTable } from './SavedCardTable'

export function SavedCartsListModal({
  open,
  setOpen,
}: {
  open: boolean
  setOpen: (value: boolean) => void
}) {
  const { formatMessage } = useIntl()

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
    >
      <div className="t-small">
        <SavedCartsTable />
      </div>
    </Modal>
  )
}
