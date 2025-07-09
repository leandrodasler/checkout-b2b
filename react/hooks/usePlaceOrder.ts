import { useMutation as useGraphQLMutation } from 'react-apollo'
import { useIntl } from 'react-intl'
import { Mutation, MutationPlaceOrderArgs } from 'ssesandbox04.checkout-b2b'

import { useClearCart, useOrderFormCustom, useToast } from '.'
import { useCheckoutB2BContext } from '../CheckoutB2BContext'
import MUTATION_PLACE_ORDER from '../graphql/placeOrder.graphql'
import { getOrderPlacedUrl, messages } from '../utils'

type MutationPlaceOrder = Pick<Mutation, 'placeOrder'>

export function usePlaceOrder() {
  const showToast = useToast()
  const { formatMessage } = useIntl()
  const { clearCart } = useClearCart()
  const { orderForm } = useOrderFormCustom()
  const { paymentAddress, shipping } = orderForm
  const {
    selectedCostCenters = [],
    poNumber,
    setOrderGroups,
  } = useCheckoutB2BContext()

  const [placeOrder, { loading }] = useGraphQLMutation<
    MutationPlaceOrder,
    MutationPlaceOrderArgs
  >(MUTATION_PLACE_ORDER, {
    variables: {
      poNumber,
      invoiceData: { address: paymentAddress ?? shipping.selectedAddress },
      selectedCostCenters,
    },
    onCompleted(data) {
      if (!data.placeOrder.length) {
        showToast({
          message: formatMessage(messages.placeOrderError),
        })

        return
      }

      if (data.placeOrder.length === 1) {
        const [singleOrder] = data.placeOrder
        const orderPlacedUrl = getOrderPlacedUrl(singleOrder.orderGroup)

        window.location.assign(orderPlacedUrl)
      } else {
        setOrderGroups(data.placeOrder)
      }

      clearCart()
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
