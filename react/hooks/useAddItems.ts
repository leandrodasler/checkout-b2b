import { useMutation } from 'react-apollo'
import { Mutation, MutationAddItemsToCartArgs } from 'ssesandbox04.checkout-b2b'

import { useToast } from '.'
import MUTATION_ADD_TO_CART from '../graphql/addItemsToCart.graphql'
import { CompleteOrderForm } from '../typings'
import { useOrderFormCustom } from './useOrderFormCustom'

type AddToCartMutation = Pick<Mutation, 'addItemsToCart'>

type Props = {
  completeData?: Partial<CompleteOrderForm>
  toastError?: boolean
}

export function useAddItems({ completeData, toastError = true }: Props) {
  const showToast = useToast()
  const { orderForm, setOrderForm } = useOrderFormCustom()

  return useMutation<AddToCartMutation, MutationAddItemsToCartArgs>(
    MUTATION_ADD_TO_CART,
    {
      onError({ message }) {
        if (!toastError || message.includes('code 429')) return

        showToast({ message })
      },
      onCompleted({ addItemsToCart }) {
        setOrderForm({
          ...orderForm,
          ...addItemsToCart,
          ...completeData,
        } as CompleteOrderForm)
      },
    }
  )
}
