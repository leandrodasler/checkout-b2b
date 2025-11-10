import { MutationHookOptions, useMutation } from 'react-apollo'
import {
  Mutation,
  MutationUpdateItemsQuantityArgs,
} from 'ssesandbox04.checkout-b2b'

import UPDATE_ITEMS_QUANTITY_MUTATION from '../graphql/updateItemsQuantity.graphql'
import { useOrderFormCustom } from './useOrderFormCustom'
import { useToast } from './useToast'

type UpdateItemsQuantityMutation = Pick<Mutation, 'updateItemsQuantity'>

export function useUpdateItemsQuantity(
  options?: MutationHookOptions<
    UpdateItemsQuantityMutation,
    MutationUpdateItemsQuantityArgs
  >
) {
  const { orderForm, setOrderForm } = useOrderFormCustom()
  const showToast = useToast()

  return useMutation<
    UpdateItemsQuantityMutation,
    MutationUpdateItemsQuantityArgs
  >(UPDATE_ITEMS_QUANTITY_MUTATION, {
    ...options,
    onError(e) {
      showToast(e)
      options?.onError?.(e)
    },
    onCompleted(data) {
      setOrderForm({
        ...orderForm,
        ...data.updateItemsQuantity,
        paymentAddress: orderForm.paymentAddress,
        customData: orderForm.customData,
      })

      options?.onCompleted?.(data)
    },
  })
}
