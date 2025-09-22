import { useMutation } from 'react-apollo'
import {
  Mutation,
  MutationUpdateItemsQuantityArgs,
} from 'ssesandbox04.checkout-b2b'

import UPDATE_ITEMS_QUANTITY_MUTATION from '../graphql/updateItemsQuantity.graphql'
import { useOrderFormCustom } from './useOrderFormCustom'
import { useToast } from './useToast'

type UpdateItemsQuantityMutation = Pick<Mutation, 'updateItemsQuantity'>

export function useUpdateItemsQuantity() {
  const { orderForm, setOrderForm } = useOrderFormCustom()

  return useMutation<
    UpdateItemsQuantityMutation,
    MutationUpdateItemsQuantityArgs
  >(UPDATE_ITEMS_QUANTITY_MUTATION, {
    onError: useToast(),
    onCompleted({ updateItemsQuantity }) {
      setOrderForm({
        ...orderForm,
        ...updateItemsQuantity,
        paymentAddress: orderForm.paymentAddress,
        customData: orderForm.customData,
      })
    },
  })
}
