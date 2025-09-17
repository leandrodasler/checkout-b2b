import { useMutation as useGraphQLMutation } from 'react-apollo'
import { useIntl } from 'react-intl'
import { Mutation, MutationPlaceOrderArgs } from 'ssesandbox04.checkout-b2b'

import { useClearCart, useOrderFormCustom, useToast } from '.'
import MUTATION_PLACE_ORDER from '../graphql/placeOrder.graphql'
import { getOrderPlacedUrl, messages } from '../utils'

type MutationPlaceOrder = Pick<Mutation, 'placeOrder'>

export function usePlaceOrder() {
  const showToast = useToast()
  const { formatMessage } = useIntl()
  const { clearCart } = useClearCart()
  const { orderForm } = useOrderFormCustom()
  const { poNumber, paymentAddress, shipping } = orderForm

  const [placeOrder, { loading }] = useGraphQLMutation<
    MutationPlaceOrder,
    MutationPlaceOrderArgs
  >(MUTATION_PLACE_ORDER, {
    refetchQueries: ['GetRepresentativeBalanceByEmail'],
    variables: {
      poNumber,
      invoiceData: { address: paymentAddress ?? shipping.selectedAddress },
    },
    onCompleted(data) {
      if (!data.placeOrder) {
        showToast({
          message: formatMessage(messages.placeOrderError),
        })

        return
      }

      clearCart()
      const orderPlacedUrl = getOrderPlacedUrl(data.placeOrder)

      window.location.assign(orderPlacedUrl)
    },
    onError(e) {
      showToast({
        message: `${formatMessage(messages.placeOrderError)}: ${e.message}`,
      })
    },
  })

  return {
    placeOrder,
    isLoading: loading,
  }
}
