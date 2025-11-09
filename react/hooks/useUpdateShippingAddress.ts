import { useMutation } from 'react-apollo'
import {
  Mutation,
  MutationUpdateSelectedAddressesArgs,
} from 'ssesandbox04.checkout-b2b'

import { useOrderFormCustom, useToast } from '.'
import MUTATION_UPDATE_SELECTED_ADDRESSES from '../graphql/updateSelectedAddresses.graphql'
import type { CompleteOrderForm } from '../typings'

type MutationUpdateSelectedAddresses = Pick<Mutation, 'updateSelectedAddresses'>

export function useUpdateShippingAddress() {
  const showToast = useToast()
  const { orderForm, setOrderForm } = useOrderFormCustom()

  return useMutation<
    MutationUpdateSelectedAddresses,
    MutationUpdateSelectedAddressesArgs
  >(MUTATION_UPDATE_SELECTED_ADDRESSES, {
    onCompleted({ updateSelectedAddresses }) {
      setOrderForm({
        ...orderForm,
        paymentAddress:
          orderForm.paymentAddress ??
          updateSelectedAddresses.shippingData.address,
        ...updateSelectedAddresses,
      } as CompleteOrderForm)
    },
    onError({ message }) {
      showToast({ message })
    },
  })
}
