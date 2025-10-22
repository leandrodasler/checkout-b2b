import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import {
  ActionMenu,
  ButtonWithIcon,
  IconCheck,
  IconCopy,
  IconEdit,
  IconPlusLines,
  IconShoppingCart,
  Spinner,
  Tag,
  Tooltip,
} from 'vtex.styleguide'

import { useCheckoutB2BContext } from '../CheckoutB2BContext'
import { usePermissions, useSaveCart } from '../hooks'
import { messages } from '../utils'
import { DiscountApprovalModal } from './DiscountApprovalModal'
import { SavedCartDiscountBadge } from './SavedCartDiscountBadge'
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
  const [openFormRenameCart, setOpenFormRenameCart] = useState(false)
  const [openDiscountKanbanModal, setOpenDiscountKanbanModal] = useState(false)
  const { selectedCart } = useCheckoutB2BContext()
  const [openSavedCartModal, setOpenSavedCartModal] = useState(false)

  const { handleSaveCart, loading } = useSaveCart({
    isCurrent: true,
  })

  const handleOpenListModal = () => setOpenSavedCartModal(true)
  const handleOpenFormModal = () => setOpenForm(true)
  const handleOpenFormRenameModal = () => setOpenFormRenameCart(true)
  const handleOpenDiscountKanbanModal = () => setOpenDiscountKanbanModal(true)

  if (!isSalesUser) return null

  return (
    <div className="flex items-center justify-center flex-wrap pl4">
      {loading && <Spinner size={20} />}
      {selectedCart && !loading && (
        <div className="flex">
          <Tag variation="low">
            <div className="flex flex-wrap items-center">
              {formatMessage(messages.savedCartsCurrentLabel)}:
              <strong>{selectedCart.title}</strong>
              <Tooltip label={formatMessage(messages.savedCartsRename)}>
                <div>
                  <ButtonWithIcon
                    size="small"
                    variation="tertiary"
                    icon={<IconEdit />}
                    onClick={handleOpenFormRenameModal}
                  />
                </div>
              </Tooltip>
              <SavedCartStatusBadge status={selectedCart.status} />
              <SavedCartDiscountBadge
                discount={selectedCart.requestedDiscount}
              />
            </div>
          </Tag>
        </div>
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
          setOpenKanban={setOpenDiscountKanbanModal}
          onChangeItems={onChangeItems}
        />
      )}
      {openForm && (
        <SavedCartsFormModal open={openForm} setOpen={setOpenForm} />
      )}
      {openFormRenameCart && (
        <SavedCartsFormModal
          open={openFormRenameCart}
          setOpen={setOpenFormRenameCart}
          isRenamingCart
        />
      )}
      {openDiscountKanbanModal && (
        <DiscountApprovalModal
          open={openDiscountKanbanModal}
          setOpen={setOpenDiscountKanbanModal}
          onChangeItems={onChangeItems}
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
