import React, { useCallback } from 'react'
import { useQuery } from 'react-apollo'
import { useIntl } from 'react-intl'
import { EXPERIMENTAL_Modal as Modal, Spinner } from 'vtex.styleguide'

import GET_ALL_SAVED_CARTS from '../graphql/getAllSavedCarts.graphql'
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

  const { data, loading } = useQuery(GET_ALL_SAVED_CARTS)

  const carts = data?.getSavedCarts ?? []

  return (
    <Modal
      isOpen={open}
      onClose={handleCloseModal}
      centered
      title={formatMessage(messages.discountKanbanModal)}
      showBottomBarBorder={false}
      style={{ minHeight: '600px', minWidth: '1280px' }}
    >
      <div>
        {!loading ? (
          <DiscountApprovalKanban requests={carts} />
        ) : (
          <div className="flex justify-center items-center">
            <Spinner />
          </div>
        )}
      </div>
    </Modal>
  )
}
