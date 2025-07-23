import { useMutation } from 'react-apollo'
import type {
  UpdateSelectedAddressMutation,
  UpdateSelectedAddressMutationVariables,
} from 'vtex.checkout-resources'
import { MutationUpdateSelectedAddress } from 'vtex.checkout-resources'

import { useOrderFormCustom, useToast } from '.'
import type { CompleteOrderForm } from '../typings'

export function useUpdateShippingAddress() {
  const showToast = useToast()
  const { orderForm, setOrderForm } = useOrderFormCustom()

  return useMutation<
    UpdateSelectedAddressMutation,
    UpdateSelectedAddressMutationVariables
  >(MutationUpdateSelectedAddress, {
    onCompleted({ updateSelectedAddress }) {
      setOrderForm({
        ...orderForm,
        paymentAddress:
          orderForm.paymentAddress ??
          updateSelectedAddress.shipping.selectedAddress,
        ...updateSelectedAddress,
      } as CompleteOrderForm)
    },
    onError({ message }) {
      showToast({ message })
    },
  })
}
