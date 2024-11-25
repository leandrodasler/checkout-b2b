import { useMutation } from '@tanstack/react-query'
import { useMutation as useGraphQLMutation } from 'react-apollo'
import { useIntl } from 'react-intl'
import type {
  Mutation,
  MutationSetOrderFormCustomDataArgs,
} from 'vtex.store-graphql'

import SET_ORDER_FORM_CUSTOM_DATA from '../graphql/setOrderFormCustomData.graphql'
import { apiRequest } from '../services'
import type {
  PaymentsBody,
  TransactionBody,
  TransactionResponse,
  WithToast,
} from '../typings'
import {
  B2B_CHECKOUT_CUSTOM_APP_ID,
  getFirstInstallmentByPaymentSystem,
  messages,
  PO_NUMBER_CUSTOM_FIELD,
} from '../utils'
import { useOrderFormCustom } from './useOrderFormCustom'

type MutationSetOrderFormCustomData = Pick<Mutation, 'setOrderFormCustomData'>

function getInvoiceDataUrl(orderFormId: string) {
  return `/api/checkout/pub/orderForm/${orderFormId}/attachments/invoiceData`
}

function getStartTransactionUrl(orderFormId: string) {
  return `/api/checkout/pub/orderForm/${orderFormId}/transaction`
}

function getPaymentsUrl(transactionId: string, orderGroup: string) {
  return `/api/payments/pub/transactions/${transactionId}/payments?orderId=${orderGroup}`
}

function getGatewayCallbackUrl(orderGroup: string) {
  return `/api/checkout/pub/gatewayCallback/${orderGroup}`
}

function getOrderPlacedUrl(orderGroup: string) {
  return `/checkout/orderPlaced?og=${orderGroup}`
}

export function usePlaceOrder(showToast: WithToast['showToast']) {
  const { formatMessage } = useIntl()
  const { orderForm } = useOrderFormCustom()
  const {
    customData,
    id,
    paymentData,
    shipping: { selectedAddress },
    storePreferencesData,
    value,
    paymentAddress,
  } = orderForm

  const poNumberCustomData = customData?.customApps.find(
    (customApp) =>
      customApp.id === B2B_CHECKOUT_CUSTOM_APP_ID &&
      !!customApp.fields?.[PO_NUMBER_CUSTOM_FIELD]
  )

  const { installmentOptions, payments } = paymentData
  const [payment] = payments
  const installment = getFirstInstallmentByPaymentSystem(
    installmentOptions,
    payment?.paymentSystem
  )

  const [setOrderFormCustomData] = useGraphQLMutation<
    MutationSetOrderFormCustomData,
    MutationSetOrderFormCustomDataArgs
  >(SET_ORDER_FORM_CUSTOM_DATA)

  const startTransactionBody: TransactionBody = {
    referenceId: id,
    optinNewsLetter: true,
    savePersonalData: true,
    value: installment?.total ?? value,
    referenceValue: payment?.referenceValue,
    interestValue: installment?.interestRate,
  }

  const { mutate, isLoading, isSuccess } = useMutation<string, Error>({
    mutationFn: async () => {
      await Promise.all([
        poNumberCustomData &&
          setOrderFormCustomData({
            variables: {
              appId: poNumberCustomData?.id,
              field: PO_NUMBER_CUSTOM_FIELD,
              value: poNumberCustomData?.fields[PO_NUMBER_CUSTOM_FIELD],
            },
          }),
        apiRequest(getInvoiceDataUrl(id), 'POST', {
          address: paymentAddress ?? selectedAddress,
        }),
      ])

      const transactionResponse = await apiRequest<TransactionResponse>(
        getStartTransactionUrl(id),
        'POST',
        startTransactionBody
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
          installmentsInterestRate: installment?.interestRate ?? 0,
          installmentsValue: installment?.value ?? 0,
          referenceValue: payment?.referenceValue,
          isBillingAddressDifferent:
            paymentAddress?.addressId !== selectedAddress?.addressId,
          fields: {
            accountId: payment?.accountId,
            address: paymentAddress ?? selectedAddress,
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
    onSuccess(orderGroup) {
      const orderPlacedUrl = getOrderPlacedUrl(orderGroup)

      window.location.assign(orderPlacedUrl)
    },
    onError(e) {
      showToast?.({
        message: `${formatMessage(messages.placeOrderError)}: ${e.message}`,
      })
    },
  })

  return { placeOrder: mutate, isLoading, isSuccess }
}
