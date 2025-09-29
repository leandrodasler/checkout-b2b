import { useMutation } from 'react-apollo'
import type {
  Mutation,
  MutationUpdateShippingOptionArgs,
} from 'ssesandbox04.checkout-b2b'

import { useOrderFormCustom, useToast } from '.'
import MUTATION_UPDATE_SHIPPING_OPTION from '../graphql/updateShippingOption.graphql'

type MutationUpdateShippingOption = Pick<Mutation, 'updateShippingOption'>

export function useUpdateShippingOption() {
  const { orderForm, setOrderForm } = useOrderFormCustom()

  return useMutation<
    MutationUpdateShippingOption,
    MutationUpdateShippingOptionArgs
  >(MUTATION_UPDATE_SHIPPING_OPTION, {
    onError: useToast(),
    onCompleted(data) {
      setOrderForm({
        ...orderForm,
        ...data.updateShippingOption,
        paymentAddress: orderForm.paymentAddress,
        customData: orderForm.customData,
      })
    },
  })
}
