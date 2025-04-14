import { useMutation } from 'react-apollo'
import type {
  AddToCartMutation,
  AddToCartMutationVariables,
} from 'vtex.checkout-resources'
import { MutationAddToCart } from 'vtex.checkout-resources'

import { useToast } from '.'
import { CompleteOrderForm } from '../typings'
import { useOrderFormCustom } from './useOrderFormCustom'

type Props = {
  completeData?: Partial<CompleteOrderForm>
  toastError?: boolean
}

export function useAddItems({ completeData, toastError = true }: Props) {
  const showToast = useToast()
  const { orderForm, setOrderForm } = useOrderFormCustom()

  return useMutation<AddToCartMutation, AddToCartMutationVariables>(
    MutationAddToCart,
    {
      onError({ message }) {
        if (!toastError || message.includes('code 429')) return

        showToast({ message })
      },
      onCompleted({ addToCart }) {
        setOrderForm({
          ...orderForm,
          ...addToCart,
          ...completeData,
        } as CompleteOrderForm)
      },
    }
  )
}
