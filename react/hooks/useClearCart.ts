import { useMutation } from '@tanstack/react-query'

import { useCheckoutB2BContext } from '../CheckoutB2BContext'
import { apiRequest } from '../services'
import type { ApiResponse, WithToast } from '../typings'
import { useOrderFormCustom, UseOrderFormReturn } from './useOrderFormCustom'

export function useClearCart(showToast: WithToast['showToast']) {
  const { orderForm, setOrderForm } = useOrderFormCustom()
  const { setPending } = useCheckoutB2BContext()

  const { mutate, isLoading } = useMutation<
    UseOrderFormReturn['orderForm'],
    Error
  >({
    mutationFn: async () => {
      setPending(true)

      return apiRequest<UseOrderFormReturn['orderForm'] & ApiResponse>(
        `/api/checkout/pub/orderForm/${orderForm.id}/items/removeAll`,
        'POST',
        {}
      ).finally(() => setPending(false))
    },
    onSuccess(newOrderForm) {
      setOrderForm(newOrderForm)
    },
    onError({ message }) {
      showToast?.({ message })
    },
  })

  return { clearCart: mutate, isLoading }
}
