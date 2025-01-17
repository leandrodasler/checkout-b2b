import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { ActionMenu } from 'vtex.styleguide'

import { useCheckoutB2BContext } from '../CheckoutB2BContext'
import { usePermissions } from '../hooks'
import { messages } from '../utils'
import { SavedCartsFormModal } from './SavedCartsFormModal'
import { SavedCartsListModal } from './SavedCartsListModal'

export function SavedCarts() {
  const { formatMessage } = useIntl()
  const { isSalesUser } = usePermissions()

  const [openForm, setOpenForm] = useState(false)
  const { openSavedCartModal, setOpenSavedCartModal } = useCheckoutB2BContext()

  const handleOpenListModal = () => {
    setOpenSavedCartModal(true)
  }

  const handleOpenFormModal = () => {
    setOpenForm(true)
  }

  if (!isSalesUser) return null

  return (
    <>
      <ActionMenu
        label={formatMessage(messages.savedCartsTitle)}
        buttonProps={{ variation: 'tertiary' }}
        options={[
          {
            label: formatMessage(messages.savedCartsSaveLabel),
            onClick: handleOpenFormModal,
          },
          {
            label: formatMessage(messages.savedCartsUseLabel),
            onClick: handleOpenListModal,
          },
        ]}
      />
      {openSavedCartModal && (
        <SavedCartsListModal
          open={openSavedCartModal}
          setOpen={setOpenSavedCartModal}
        />
      )}
      {openForm && (
        <SavedCartsFormModal open={openForm} setOpen={setOpenForm} />
      )}
    </>
  )
}
