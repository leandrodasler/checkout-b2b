import React, { useState } from 'react'
import { useMutation } from 'react-apollo'
import { useIntl } from 'react-intl'
import type { Mutation, MutationSaveCartArgs } from 'ssesandbox04.checkout-b2b'
import { ActionMenu } from 'vtex.styleguide'

import GET_SAVED_CARTS from '../graphql/getSavedCarts.graphql'
import SAVE_CART_MUTATION from '../graphql/saveCart.graphql'
import { usePermissions, useToast } from '../hooks'
import { messages } from '../utils'
import { SavedCartsModal } from './SavedCartsModal'

type SaveCardMutation = Pick<Mutation, 'saveCart'>

export function SavedCarts() {
  const showToast = useToast()
  const { formatMessage } = useIntl()
  const { isSaleUser } = usePermissions()
  const [open, setOpen] = useState(false)
  const [saveCart, { loading }] = useMutation<
    SaveCardMutation,
    MutationSaveCartArgs
  >(SAVE_CART_MUTATION, {
    refetchQueries: [{ query: GET_SAVED_CARTS }],
    onCompleted() {
      showToast({ message: formatMessage(messages.savedCartsSaveSuccess) })
    },
    onError({ message }) {
      showToast({ message })
    },
  })

  const handleOpenModal = () => {
    setOpen(true)
  }

  if (!isSaleUser) return null

  return (
    <>
      <ActionMenu
        loading={loading}
        label={formatMessage(messages.savedCartsTitle)}
        buttonProps={{ variation: 'tertiary', isLoading: loading }}
        options={[
          {
            label: formatMessage(messages.savedCartsSaveLabel),
            onClick: saveCart,
          },
          {
            label: formatMessage(messages.savedCartsUseLabel),
            onClick: handleOpenModal,
          },
        ]}
      />
      {open && <SavedCartsModal open={open} setOpen={setOpen} />}
    </>
  )
}
