import React, { useCallback } from 'react'
import { useIntl } from 'react-intl'
import { Button, EXPERIMENTAL_Modal as Modal } from 'vtex.styleguide'

import { messages } from '../utils'
import { DiscountApprovalKanban } from './DiscountApprovalKanban'

type Props = {
  open: boolean
  setOpen: (value: boolean) => void
}

export function DiscountApprovalModal({ open, setOpen }: Props) {
  const { formatMessage } = useIntl()

  const handleCloseModal = useCallback(() => {
    setOpen(false)
  }, [setOpen])

  return (
    <Modal
      isOpen={open}
      onClose={handleCloseModal}
      centered
      title={formatMessage(messages.discountChanges)}
      showBottomBarBorder={false}
      style={{ minHeight: '600px', minWidth: '1280px' }}
      bottomBar={
        // TODO: implements actions
        <div className="flex justify-end">
          <Button variation="tertiary" onClick={handleCloseModal}>
            {formatMessage(messages.cancel)}
          </Button>
        </div>
      }
    >
      <div>
        <DiscountApprovalKanban />
      </div>
    </Modal>
  )
}
