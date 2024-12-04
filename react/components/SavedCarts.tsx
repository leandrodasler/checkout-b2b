import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { ActionMenu } from 'vtex.styleguide'

import { usePermissions } from '../hooks'
import { messages } from '../utils'
import { SavedCartsFormModal } from './SavedCartsFormModal'
import { SavedCartsListModal } from './SavedCartsListModal'

export function SavedCarts() {
  const { formatMessage } = useIntl()
  const { isSalesUser } = usePermissions()
  const [openList, setOpenList] = useState(false)
  const [openForm, setOpenForm] = useState(false)

  const handleOpenListModal = () => {
    setOpenList(true)
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
      {openList && (
        <SavedCartsListModal open={openList} setOpen={setOpenList} />
      )}
      {openForm && (
        <SavedCartsFormModal open={openForm} setOpen={setOpenForm} />
      )}
    </>
  )
}
