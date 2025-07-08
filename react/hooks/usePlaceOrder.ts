// import { useMutation } from '@tanstack/react-query'
// import { useMutation as useGraphQLMutation } from 'react-apollo'
// import { useIntl } from 'react-intl'
// import type {
//   Mutation,
//   MutationSetOrderFormCustomDataArgs,
// } from 'vtex.store-graphql'

// import { useOrderFormCustom, useToast } from '.'
// import SET_ORDER_FORM_CUSTOM_DATA from '../graphql/setOrderFormCustomData.graphql'
// import { apiRequest } from '../services'
// import type {
//   PaymentsBody,
//   TransactionBody,
//   TransactionResponse,
// } from '../typings'
// import {
//   B2B_CHECKOUT_CUSTOM_APP_ID,
//   getFirstInstallmentByPaymentSystem,
//   messages,
//   PO_NUMBER_CUSTOM_FIELD,
// } from '../utils'
import { useMutation as useGraphQLMutation } from 'react-apollo'
import { useIntl } from 'react-intl'

import { useOrderFormCustom, useToast } from '.'
import { useCheckoutB2BContext } from '../CheckoutB2BContext'
import MutationPlaceOrder from '../graphql/placeOrder.graphql'
import { messages } from '../utils'

// type MutationSetOrderFormCustomData = Pick<Mutation, 'setOrderFormCustomData'>

// function getInvoiceDataUrl(orderFormId: string) {
//   return `/api/checkout/pub/orderForm/${orderFormId}/attachments/invoiceData`
// }

// function getStartTransactionUrl(orderFormId: string) {
//   return `/api/checkout/pub/orderForm/${orderFormId}/transaction`
// }

// function getPaymentsUrl(transactionId: string, orderGroup: string) {
//   return `/api/payments/pub/transactions/${transactionId}/payments?orderId=${orderGroup}`
// }

// function getGatewayCallbackUrl(orderGroup: string) {
//   return `/api/checkout/pub/gatewayCallback/${orderGroup}`
// }

function getOrderPlacedUrl(orderGroup: string) {
  return `/checkout/orderPlaced?og=${orderGroup}`
}

export function usePlaceOrder() {
  const showToast = useToast()
  const { formatMessage } = useIntl()

  const { orderForm } = useOrderFormCustom()
  const {
    // customData,
    // id,
    // paymentData,
    // shipping: { selectedAddress },
    // storePreferencesData,
    // value,
    paymentAddress,
  } = orderForm

  // const poNumberCustomData = customData?.customApps.find(
  //   (customApp) =>
  //     customApp.id === B2B_CHECKOUT_CUSTOM_APP_ID &&
  //     !!customApp.fields?.[PO_NUMBER_CUSTOM_FIELD]
  // )

  const { selectedCostCenters, poNumber } = useCheckoutB2BContext()

  const [placeOrder, { loading, data, error }] = useGraphQLMutation(
    MutationPlaceOrder,
    {
      variables: {
        poNumber,
        invoiceData: { address: paymentAddress },
        selectedCostCenters,
      },
      onCompleted(response: { placeOrder: string[] }) {
        console.info({ response })

        const orderPlacedUrl = getOrderPlacedUrl(response.placeOrder[0])

        console.info({ orderPlacedUrl })

        showToast({
          message: `Order groups gerados: ${response.placeOrder.join(', ')}`,
        })
        //     window.location.assign(orderPlacedUrl)
      },
      onError(e) {
        showToast({
          message: `${formatMessage(messages.placeOrderError)}: ${e.message}`,
        })
      },
    }
  )

  return {
    placeOrder,
    isLoading: loading,
    isSuccess: !loading && !error && !!data,
  }

  // const { installmentOptions, payments } = paymentData
  // const [payment] = payments
  // const installment = getFirstInstallmentByPaymentSystem(
  //   installmentOptions,
  //   payment?.paymentSystem
  // )

  // const [setOrderFormCustomData] = useGraphQLMutation<
  //   MutationSetOrderFormCustomData,
  //   MutationSetOrderFormCustomDataArgs
  // >(SET_ORDER_FORM_CUSTOM_DATA)

  // const startTransactionBody: TransactionBody = {
  //   referenceId: id,
  //   optinNewsLetter: true,
  //   savePersonalData: true,
  //   value: installment?.total ?? value,
  //   referenceValue: payment?.referenceValue,
  //   interestValue: installment?.interestRate,
  // }

  // const { mutate, isLoading, isSuccess } = useMutation<string, Error>({
  //   mutationFn: async () => {
  //     await Promise.all([
  //       poNumberCustomData &&
  //         setOrderFormCustomData({
  //           variables: {
  //             appId: poNumberCustomData?.id,
  //             field: PO_NUMBER_CUSTOM_FIELD,
  //             value: poNumberCustomData?.fields[PO_NUMBER_CUSTOM_FIELD],
  //           },
  //         }),
  //       apiRequest(getInvoiceDataUrl(id), 'POST', {
  //         address: paymentAddress ?? selectedAddress,
  //       }),
  //     ])

  //     const transactionResponse = await apiRequest<TransactionResponse>(
  //       getStartTransactionUrl(id),
  //       'POST',
  //       startTransactionBody
  //     )

  //     const {
  //       id: transactionId,
  //       orderGroup,
  //       messages: transactionMessages,
  //     } = transactionResponse

  //     if (transactionMessages?.length) {
  //       throw new Error(transactionMessages[0].text)
  //     }

  //     const paymentsBody: PaymentsBody = [
  //       {
  //         paymentSystem: +(payment?.paymentSystem ?? 0),
  //         installments: payment?.installments,
  //         currencyCode: storePreferencesData?.currencyCode,
  //         value: payment?.value ?? value,
  //         installmentsInterestRate: installment?.interestRate ?? 0,
  //         installmentsValue: installment?.value ?? 0,
  //         referenceValue: payment?.referenceValue,
  //         isBillingAddressDifferent:
  //           paymentAddress?.addressId !== selectedAddress?.addressId,
  //         fields: {
  //           accountId: payment?.accountId,
  //           address: paymentAddress ?? selectedAddress,
  //         },
  //         transaction: {
  //           id: transactionId,
  //           merchantName:
  //             transactionResponse.merchantTransactions?.[0]?.merchantName,
  //         },
  //       },
  //     ]

  //     await apiRequest<never>(
  //       getPaymentsUrl(transactionId, orderGroup),
  //       'POST',
  //       paymentsBody
  //     )

  //     await apiRequest<never>(getGatewayCallbackUrl(orderGroup), 'POST')

  //     return orderGroup
  //   },
  //   onSuccess(orderGroup) {
  //     const orderPlacedUrl = getOrderPlacedUrl(orderGroup)

  //     window.location.assign(orderPlacedUrl)
  //   },
  //   onError(e) {
  //     showToast({
  //       message: `${formatMessage(messages.placeOrderError)}: ${e.message}`,
  //     })
  //   },
  // })

  // return { placeOrder: mutate, isLoading, isSuccess }
}
