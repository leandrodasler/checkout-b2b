import { useMutation } from '@tanstack/react-query'

import { useOrderFormCustom, useToast } from '.'
import { useCheckoutB2BContext } from '../CheckoutB2BContext'
import { apiRequest } from '../services'
import type { ApiResponse, CompleteOrderForm } from '../typings'

export function useClearCart() {
  const showToast = useToast()
  const { orderForm, setOrderForm } = useOrderFormCustom()
  const { setPending } = useCheckoutB2BContext()

  const { mutate, isLoading } = useMutation<CompleteOrderForm, Error>({
    mutationFn: async () => {
      setPending(true)

      return apiRequest<CompleteOrderForm & ApiResponse>(
        `/api/checkout/pub/orderForm/${orderForm.id}/items/removeAll`,
        'POST',
        {}
      ).finally(() => setPending(false))
    },
    onSuccess(newOrderForm) {
      setOrderForm(newOrderForm)
    },
    onError({ message }) {
      showToast({ message })
    },
  })

  return { clearCart: mutate, isLoading }
}
