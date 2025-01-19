import { useMutation } from '@tanstack/react-query'
import { useCallback } from 'react'
import { useRuntime } from 'vtex.render-runtime'

import { useOrderFormCustom, useToast } from '.'
import { useCheckoutB2BContext } from '../CheckoutB2BContext'
import { apiRequest } from '../services'
import type { ApiResponse, CompleteOrderForm } from '../typings'

export function useClearCart(updateOrderForm = true) {
  const showToast = useToast()
  const { setQuery } = useRuntime()
  const { orderForm, setOrderForm } = useOrderFormCustom()
  const { setPending, setSelectedCart } = useCheckoutB2BContext()
  const handlePending = useCallback(
    (pending: boolean) => {
      updateOrderForm && setPending(pending)
    },
    [updateOrderForm, setPending]
  )

  const { mutate, isLoading } = useMutation<CompleteOrderForm, Error>({
    mutationFn: async () => {
      handlePending(true)

      return apiRequest<CompleteOrderForm & ApiResponse>(
        `/api/checkout/pub/orderForm/${orderForm.id}/items/removeAll`,
        'POST',
        {}
      ).finally(() => handlePending(false))
    },
    onSuccess(newOrderForm) {
      if (!updateOrderForm) return

      setOrderForm(newOrderForm)
      setSelectedCart(null)
      setQuery({ savedCart: undefined })
    },
    onError({ message }) {
      showToast({ message })
    },
  })

  return { clearCart: mutate, isLoading }
}
