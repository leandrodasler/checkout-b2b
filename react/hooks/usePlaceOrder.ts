import { useMutation } from '@tanstack/react-query'
import { useIntl } from 'react-intl'

import { apiRequest } from '../services'
import type {
  PaymentsBody,
  TransactionBody,
  TransactionResponse,
  WithToast,
} from '../typings'
import { getFirstInstallmentByPaymentSystem, messages } from '../utils'
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
  const { id, paymentData, value, storePreferencesData, shipping } = orderForm
  const { installmentOptions, payments } = paymentData
  const [payment] = payments
  const installment = getFirstInstallmentByPaymentSystem(
    installmentOptions,
    payment?.paymentSystem
  )

  const args: TransactionBody = {
    referenceId: id,
    optinNewsLetter: true,
    savePersonalData: true,
    value: installment?.total ?? value,
    referenceValue: payment?.referenceValue,
    interestValue: installment?.interestRate,
  }

  const { mutate, data, isLoading, isSuccess, error } = useMutation<
    string,
    Error
  >({
    mutationFn: async () => {
      const transactionResponse = await apiRequest<TransactionResponse>(
        getStartTransactionUrl(id),
        'POST',
        args
      )

      const {
        id: transactionId,
        orderGroup,
        messages: transactionMessages,
      } = transactionResponse

      if (transactionMessages?.length) {
        throw new Error(transactionMessages[0].text)
      }

      const paymentsBody: PaymentsBody = [
        {
          paymentSystem: +(payment?.paymentSystem ?? 0),
          installments: payment?.installments,
          currencyCode: storePreferencesData?.currencyCode,
          value: payment?.value ?? value,
          installmentsInterestRate: 0,
          installmentsValue: 0,
          referenceValue: payment?.referenceValue,
          fields: {
            accountId: payment?.accountId,
            address: shipping.selectedAddress,
          },
          transaction: {
            id: transactionId,
            merchantName:
              transactionResponse.merchantTransactions?.[0]?.merchantName,
          },
        },
      ]

      await apiRequest<never>(
        getPaymentsUrl(transactionId, orderGroup),
        'POST',
        paymentsBody
      )

      await apiRequest<never>(getGatewayCallbackUrl(orderGroup), 'POST')

      return orderGroup
    },
    onError(e) {
      showToast?.({
        message: `${formatMessage(messages.placeOrderError)}: ${e.message}`,
      })
    },
  })

  return { placeOrder: mutate, orderGroup: data, isLoading, isSuccess, error }
}
