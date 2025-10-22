import { useMutation } from 'react-apollo'
import { useIntl } from 'react-intl'
import type { Mutation, MutationSaveCartArgs } from 'ssesandbox04.checkout-b2b'

import { useOrderFormCustom, useToast } from '.'
import { useCheckoutB2BContext } from '../CheckoutB2BContext'
import GET_SAVED_CARTS from '../graphql/getSavedCarts.graphql'
import SAVE_CART_MUTATION from '../graphql/saveCart.graphql'
import { messages } from '../utils'

type SaveCardMutation = Pick<Mutation, 'saveCart'>

type Props = {
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>
  isCurrent: boolean
  title?: string
}

export function useSaveCart({ setOpen, isCurrent, title }: Props) {
  const { setPending, selectedCart, setSelectedCart } = useCheckoutB2BContext()
  const { orderForm } = useOrderFormCustom()
  const showToast = useToast()
  const { formatMessage } = useIntl()

  const [saveCartMutation, { loading }] = useMutation<
    SaveCardMutation,
    MutationSaveCartArgs
  >(SAVE_CART_MUTATION, {
    refetchQueries: [{ query: GET_SAVED_CARTS }],
    onCompleted({ saveCart }) {
      showToast({ message: formatMessage(messages.savedCartsSaveSuccess) })
      setSelectedCart(saveCart)
    },
    onError({ message }) {
      showToast({ message })
    },
  })

  const handleSaveCart = () => {
    setPending(true)
    setSelectedCart(null)

    const additionalData = JSON.stringify({
      paymentAddress: orderForm.paymentAddress,
      customData: orderForm.customData,
    })

    saveCartMutation({
      variables: {
        title,
        additionalData,
        parentCartId: isCurrent
          ? selectedCart?.parentCartId ?? selectedCart?.id
          : null,
      },
    }).finally(() => {
      setPending(false)
      setOpen?.(false)
    })
  }

  return { handleSaveCart, loading }
}
