import { useMutation } from 'react-apollo'
import type { PaymentDataInput } from 'vtex.checkout-graphql'
import type { UpdateOrderFormPaymentMutation } from 'vtex.checkout-resources'
import { MutationUpdateOrderFormPayment } from 'vtex.checkout-resources'

import { useOrderFormCustom, useToast } from '.'
import type { CompleteOrderForm } from '../typings'

export function useUpdatePayment() {
  const showToast = useToast()
  const { orderForm, setOrderForm } = useOrderFormCustom()

  const [updatePayment, { loading, error }] = useMutation<
    UpdateOrderFormPaymentMutation,
    { paymentData: PaymentDataInput }
  >(MutationUpdateOrderFormPayment, {
    onCompleted({ updateOrderFormPayment }) {
      setOrderForm({
        ...orderForm,
        ...updateOrderFormPayment,
        customData: orderForm.customData,
      } as CompleteOrderForm)
    },
    onError({ message }) {
      showToast({ message })
    },
  })

  return { updatePayment, loading, error }
}
