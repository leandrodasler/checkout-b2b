import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import {
  ActionMenu,
  ButtonWithIcon,
  IconCheck,
  IconCopy,
  IconEdit,
  IconInfo,
  IconPlusLines,
  IconShoppingCart,
  Spinner,
  Tag,
  Tooltip,
} from 'vtex.styleguide'

import { useCheckoutB2BContext } from '../../CheckoutB2BContext'
import { useOrderFormCustom, usePermissions, useSaveCart } from '../../hooks'
import { messages } from '../../utils'
import { DiscountApprovalModal } from './DiscountApprovalModal'
import { SavedCartCommentBadge } from './SavedCartCommentBadge'
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
  const {
    selectedCart,
    loadingCurrentSavedCart,
    useCartLoading,
  } = useCheckoutB2BContext()

  const [openSavedCartModal, setOpenSavedCartModal] = useState(false)
  const { orderForm } = useOrderFormCustom()
  const userEmail = orderForm.clientProfileData?.email

  const { handleSaveCart, loading: saveCartLoading } = useSaveCart({
    isCurrent: true,
  })

  const handleOpenListModal = () => setOpenSavedCartModal(true)
  const handleOpenFormModal = () => setOpenForm(true)
  const handleOpenFormRenameModal = () => setOpenFormRenameCart(true)
  const handleOpenDiscountKanbanModal = () => setOpenDiscountKanbanModal(true)
  const loading = loadingCurrentSavedCart || useCartLoading || saveCartLoading

  if (!isSalesUser) return null

  return (
    <div className="flex items-center justify-center flex-wrap pl4">
      {loading && <Spinner size={20} />}
      {selectedCart && !loading && (
        <Tag variation="low">
          <div className="flex flex-wrap items-center justify-center">
            {formatMessage(messages.savedCartsCurrentLabel)}:
            <strong>{selectedCart.title}</strong>
            {userEmail && selectedCart.email !== userEmail && (
              <Tooltip
                label={formatMessage(messages.savedCartsAnotherUser, {
                  email: selectedCart.email,
                })}
              >
                <div>
                  <ButtonWithIcon
                    size="small"
                    variation="danger-tertiary"
                    icon={
                      <span className="c-danger">
                        <IconInfo />
                      </span>
                    }
                    disabled
                  />
                </div>
              </Tooltip>
            )}
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
            <SavedCartCommentBadge cart={selectedCart} />
            <SavedCartStatusBadge status={selectedCart.status} />
            <SavedCartDiscountBadge discount={selectedCart.requestedDiscount} />
          </div>
        </Tag>
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
          setOpenTable={setOpenSavedCartModal}
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
