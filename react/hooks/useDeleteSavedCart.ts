import { UpdateQueryOptions } from 'apollo-client'
import {
  MutationHookOptions,
  OperationVariables,
  useMutation,
} from 'react-apollo'
import type {
  Mutation,
  MutationDeleteCartArgs,
  SavedCart,
} from 'ssesandbox04.checkout-b2b'

import { useCheckoutB2BContext } from '../CheckoutB2BContext'
import DELETE_SAVED_CART from '../graphql/deleteCart.graphql'
import { GetSavedCartsQuery } from '../typings'
import { useClearCart } from './useClearCart'
import { useOrderFormCustom } from './useOrderFormCustom'
import { useToast } from './useToast'

type Props = {
  onChangeItems?: () => void
  updateQuery?: <TVars = OperationVariables>(
    mapFn: (
      previousQueryResult: GetSavedCartsQuery,
      options: UpdateQueryOptions<TVars>
    ) => GetSavedCartsQuery
  ) => void
  childrenCarts?: Record<string, SavedCart[]>
  setChildrenCarts?: (
    value: React.SetStateAction<Record<string, SavedCart[]>>
  ) => void
  options?: MutationHookOptions<
    Pick<Mutation, 'deleteCart'>,
    MutationDeleteCartArgs
  >
}

export function useDeleteSavedCart(props?: Props) {
  const showToast = useToast()
  const { setOrderForm } = useOrderFormCustom()
  const { selectedCart, setSelectedCart } = useCheckoutB2BContext()
  const { clearCart } = useClearCart({
    updateOrderForm: false,
    onChangeItems: props?.onChangeItems,
  })

  return useMutation<Pick<Mutation, 'deleteCart'>, MutationDeleteCartArgs>(
    DELETE_SAVED_CART,
    {
      onError: showToast,
      onCompleted({ deleteCart }) {
        if (!deleteCart) return

        if (
          selectedCart?.id === deleteCart ||
          selectedCart?.parentCartId === deleteCart
        ) {
          setSelectedCart(null)

          if (
            selectedCart.status === 'denied' ||
            selectedCart.status === 'pending'
          ) {
            clearCart().then((clearCartData) => {
              setOrderForm(clearCartData.data?.clearCart)
            })
          }
        }

        const deletedChild: Record<string, boolean> = { '': false }

        if (props?.childrenCarts) {
          Object.keys(props.childrenCarts).forEach((parentCartId) => {
            if (
              props.childrenCarts?.[parentCartId].some(
                (c) => c.id === deleteCart
              )
            ) {
              deletedChild[parentCartId] = true
              props?.setChildrenCarts?.({
                ...props.childrenCarts,
                [parentCartId]: props.childrenCarts[parentCartId].filter(
                  (c) => c.id !== deleteCart
                ),
              })
            }
          })
        }

        props?.updateQuery?.((prev) => ({
          getSavedCarts: prev.getSavedCarts
            .filter(
              (cart: SavedCart) =>
                cart.id !== deleteCart && cart.parentCartId !== deleteCart
            )
            .map((cart: SavedCart) => ({
              ...cart,
              childrenQuantity: deletedChild[cart.id]
                ? (cart.childrenQuantity ?? 1) - 1
                : cart.childrenQuantity,
            })),
        }))
      },
      ...props?.options,
    }
  )
}
