import { useMutation } from '@tanstack/react-query'
import { useIntl } from 'react-intl'

import { apiRequest } from '../services'
import type {
  ApiResponse,
  TransactionBody,
  TransactionResponse,
  WithToast,
} from '../typings'
import { messages } from '../utils'
import { useOrderFormCustom } from './useOrderFormCustom'

function getStartTransactionUrl(orderFormId: string) {
  return `/api/checkout/pub/orderForm/${orderFormId}/transaction`
}

function getPaymentsUrl(transactionId: string, orderGroup: string) {
  return `/api/payments/pub/transactions/${transactionId}/payments?orderId=${orderGroup}`
}

function getGatewayCallbackUrl(orderGroup: string) {
  return `/api/checkout/pub/gatewayCallback/${orderGroup}`
}

export function usePlaceOrder(showToast: WithToast['showToast']) {
  const { formatMessage } = useIntl()
  const { orderForm } = useOrderFormCustom()
  const { id, value, paymentData } = orderForm

  const args: TransactionBody = {
    referenceId: id,
    optinNewsLetter: true,
    savePersonalData: true,
    value: paymentData.payments[0]?.value ?? value,
    referenceValue: paymentData.payments[0]?.referenceValue,
    interestValue: 0,
  }

  const { mutate: placeOrder, data, isLoading, error } = useMutation<
    ApiResponse,
    Error
  >({
    mutationFn: async () => {
      const transactionResponse = await apiRequest<TransactionResponse>(
        getStartTransactionUrl(id),
        'POST',
        args
      )

      // eslint-disable-next-line no-console
      console.log({ transactionResponse })

      const { id: transactionId, orderGroup } = transactionResponse

      // TODO: montar um body para o request de pagamentos
      const paymentsResponse = await apiRequest<ApiResponse & unknown>(
        getPaymentsUrl(transactionId, orderGroup),
        'POST'
      )

      // eslint-disable-next-line no-console
      console.log({ paymentsResponse })

      return apiRequest<TransactionResponse>(
        getGatewayCallbackUrl(orderGroup),
        'POST'
      )
    },
    onError(e) {
      showToast?.({
        message: `${formatMessage(messages.placeOrderError)}: ${e.message}`,
      })
    },
  })

  return { placeOrder, data, isLoading, error }
}
