import { useMutation as useGraphQLMutation } from 'react-apollo'
import { useIntl } from 'react-intl'
import { Mutation, MutationPlaceOrderArgs } from 'ssesandbox04.checkout-b2b'

import { useOrderFormCustom, useToast } from '.'
import { useCheckoutB2BContext } from '../CheckoutB2BContext'
import MUTATION_PLACE_ORDER from '../graphql/placeOrder.graphql'
import { getOrderPlacedUrl, messages } from '../utils'

type MutationPlaceOrder = Pick<Mutation, 'placeOrder'>

export function usePlaceOrder() {
  const showToast = useToast()
  const { formatMessage } = useIntl()
  const { orderForm } = useOrderFormCustom()
  const { paymentAddress, shipping } = orderForm
  const {
    selectedCostCenters,
    poNumber,
    setOrderGroups,
  } = useCheckoutB2BContext()

  const [placeOrder, { loading, data, error }] = useGraphQLMutation<
    MutationPlaceOrder,
    MutationPlaceOrderArgs
  >(MUTATION_PLACE_ORDER, {
    variables: {
      poNumber,
      invoiceData: { address: paymentAddress ?? shipping.selectedAddress },
      selectedCostCenters,
    },
    onCompleted(response: { placeOrder: string[] }) {
      if (!response.placeOrder.length) {
        showToast({
          message: formatMessage(messages.placeOrderError),
        })

        return
      }

      if (response.placeOrder.length === 1) {
        const orderPlacedUrl = getOrderPlacedUrl(response.placeOrder[0])

        window.location.assign(orderPlacedUrl)
      } else {
        setOrderGroups(
          selectedCostCenters?.map((costCenter, index) => ({
            costCenter: costCenter.costCenterName ?? '',
            orderGroup: response.placeOrder[index],
          }))
        )
      }
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
    isSuccess: !loading && !error && !!data,
  }
}
