import React, { createRef, useCallback } from 'react'
import { useMutation } from 'react-apollo'
import { useIntl } from 'react-intl'
import type { Mutation, MutationSaveCartArgs } from 'ssesandbox04.checkout-b2b'
import { Button, Input, Modal } from 'vtex.styleguide'

import { useCheckoutB2BContext } from '../CheckoutB2BContext'
import GET_SAVED_CARTS from '../graphql/getSavedCarts.graphql'
import SAVE_CART_MUTATION from '../graphql/saveCart.graphql'
import { useOrderFormCustom, useToast } from '../hooks'
import type { ModalProps } from '../typings'
import { messages } from '../utils'

type SaveCardMutation = Pick<Mutation, 'saveCart'>

export function SavedCartsFormModal({ open, setOpen }: ModalProps) {
  const { setPending } = useCheckoutB2BContext()
  const { orderForm } = useOrderFormCustom()
  const showToast = useToast()
  const { formatMessage } = useIntl()
  const titleInput = createRef<HTMLInputElement>()

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

  const handleCloseModal = useCallback(() => {
    setOpen(false)
  }, [setOpen])

  const handleSaveCart = useCallback(() => {
    setPending(true)

    const title =
      (titleInput.current?.value ?? '').trim() ||
      formatMessage(messages.savedCartsSaveDefaultTitle, {
        date: new Date().toLocaleString(),
      })

    const additionalData = JSON.stringify({
      paymentAddress: orderForm.paymentAddress,
    })

    saveCart({
      variables: { title, additionalData },
    }).finally(() => {
      setPending(false)
      handleCloseModal()
    })
  }, [
    formatMessage,
    handleCloseModal,
    orderForm.paymentAddress,
    saveCart,
    setPending,
    titleInput,
  ])

  return (
    <Modal
      isOpen={open}
      onClose={handleCloseModal}
      size="small"
      title={formatMessage(messages.savedCartsSaveLabel)}
      bottomBar={
        <div className="flex flex-wrap items-center justify-around justify-between-ns w-100">
          <Button
            disabled={loading}
            variation="tertiary"
            onClick={handleCloseModal}
          >
            {formatMessage(messages.cancel)}
          </Button>
          <Button
            variation="primary"
            disabled={loading}
            isLoading={loading}
            onClick={handleSaveCart}
          >
            {formatMessage(messages.confirm)}
          </Button>
        </div>
      }
    >
      <div className="pb7">
        <Input
          ref={titleInput}
          size="small"
          disabled={loading}
          label={formatMessage(messages.savedCartsSaveTitle)}
          placeholder={formatMessage(messages.savedCartsSavePlaceholder)}
        />
      </div>
    </Modal>
  )
}
