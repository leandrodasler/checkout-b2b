import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import {
  ActionMenu,
  IconCheck,
  IconCopy,
  IconPlusLines,
  IconShoppingCart,
  Spinner,
  Tag,
} from 'vtex.styleguide'

import { useCheckoutB2BContext } from '../CheckoutB2BContext'
import { usePermissions, useSaveCart } from '../hooks'
import { messages } from '../utils'
import { DiscountApprovalModal } from './DiscountApprovalModal'
import { SavedCartsFormModal } from './SavedCartsFormModal'
import { SavedCartsListModal } from './SavedCartsListModal'
import { SavedCartStatusBadge } from './SavedCartStatusBadge'

type Props = {
  onChangeItems: () => void
}

export function SavedCarts({ onChangeItems }: Props) {
  const { formatMessage } = useIntl()
  const { isSalesUser } = usePermissions()

  const [openForm, setOpenForm] = useState(false)

  const [openDiscountKanbanModal, setOpenDiscountKanbanModal] = useState(false)

  const {
    selectedCart,
    openSavedCartModal,
    setOpenSavedCartModal,
  } = useCheckoutB2BContext()

  const { handleSaveCart, loading } = useSaveCart({
    isCurrent: true,
  })

  const handleOpenListModal = () => setOpenSavedCartModal(true)
  const handleOpenFormModal = () => setOpenForm(true)
  const handleOpenDiscountKanbanModal = () => setOpenDiscountKanbanModal(true)

  if (!isSalesUser) return null

  return (
    <div className="flex items-center flex-wrap pl4">
      {loading && <Spinner size={20} />}
      {selectedCart && !loading && (
        <>
          <Tag variation="low">
            {formatMessage(messages.savedCartsCurrentLabel)}:{' '}
            <strong>{selectedCart.title}</strong>{' '}
            <SavedCartStatusBadge status={selectedCart.status} />
          </Tag>
        </>
      )}
      <ActionMenu
        label={formatMessage(messages.savedCartsMainTitle)}
        buttonProps={{ variation: 'tertiary' }}
        options={[
          ...(selectedCart
            ? [
                {
                  label: (
                    <OptionMenuWrapper icon={<IconCopy size={12} />}>
                      {formatMessage(messages.savedCartsSaveCurrent)}
                    </OptionMenuWrapper>
                  ),
                  onClick: handleSaveCart,
                },
              ]
            : []),
          {
            label: (
              <OptionMenuWrapper icon={<IconPlusLines size={12} />}>
                {formatMessage(messages.savedCartsSaveNew)}
              </OptionMenuWrapper>
            ),
            onClick: handleOpenFormModal,
          },
          {
            label: (
              <OptionMenuWrapper icon={<IconShoppingCart size={12} />}>
                {formatMessage(messages.savedCartsTitle)}
              </OptionMenuWrapper>
            ),
            onClick: handleOpenListModal,
          },
          {
            label: (
              <OptionMenuWrapper icon={<IconCheck size={12} />}>
                {formatMessage(messages.discountKanbanModal)}
              </OptionMenuWrapper>
            ),
            onClick: handleOpenDiscountKanbanModal,
          },
        ]}
      />
      {openSavedCartModal && (
        <SavedCartsListModal
          open={openSavedCartModal}
          setOpen={setOpenSavedCartModal}
          onChangeItems={onChangeItems}
        />
      )}
      {openForm && (
        <SavedCartsFormModal open={openForm} setOpen={setOpenForm} />
      )}
      {openDiscountKanbanModal && (
        <DiscountApprovalModal
          open={openDiscountKanbanModal}
          setOpen={setOpenDiscountKanbanModal}
        />
      )}
    </div>
  )
}

function OptionMenuWrapper({
  icon,
  children,
}: React.PropsWithChildren<{ icon: React.ReactNode }>) {
  return (
    <div className="flex flex-wrap items-center">
      <div className="mr2">{icon}</div>
      {children}
    </div>
  )
}
