import { useCallback } from 'react'
import { useMutation } from 'react-apollo'
import { Mutation } from 'ssesandbox04.checkout-b2b'

import { useOrderFormCustom, useToast } from '.'
import { useCheckoutB2BContext } from '../CheckoutB2BContext'
import CLEAR_CART from '../graphql/clearCart.graphql'

type MutationClearCart = Pick<Mutation, 'clearCart'>

type Props = {
  updateOrderForm?: boolean
  onChangeItems?: () => void
}

export function useClearCart(props?: Props) {
  const { updateOrderForm = true, onChangeItems } = props ?? {}
  const showToast = useToast()
  const { setOrderForm } = useOrderFormCustom()
  const { setPending, setSelectedCart } = useCheckoutB2BContext()
  const handlePending = useCallback(
    (pending: boolean) => {
      updateOrderForm && setPending(pending)
    },
    [updateOrderForm, setPending]
  )

  const [mutate, { loading }] = useMutation<MutationClearCart>(CLEAR_CART, {
    onCompleted({ clearCart }) {
      onChangeItems?.()
      handlePending(false)

      if (!updateOrderForm) return

      setOrderForm(clearCart)
    },
    onError: showToast,
  })

  const clearCart = useCallback(() => {
    if (updateOrderForm) {
      setSelectedCart(null)
    }

    handlePending(true)

    return mutate()
  }, [handlePending, mutate, setSelectedCart, updateOrderForm])

  return { clearCart, isLoading: loading }
}
