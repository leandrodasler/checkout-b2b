/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NotFoundError, ResolverError, ServiceContext } from '@vtex/api'
import { OrderForm } from '@vtex/clients'
import { Address, PaymentData } from 'vtex.checkout-graphql'

import { Clients } from '../../clients'
import { getFirstInstallmentByPaymentSystem, getSessionData } from '../../utils'

const B2B_CHECKOUT_CUSTOM_APP_ID = 'b2b-checkout-settings'
// const B2B_CHECKOUT_CUSTOM_APP_MAJOR = 1
const PO_NUMBER_CUSTOM_FIELD = 'purchaseOrderNumber'

type PlaceOrderArgs = {
  poNumber?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  invoiceData?: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selectedCostCenters: any[]
}

export async function placeOrder(
  _: unknown,
  { poNumber, invoiceData, selectedCostCenters }: PlaceOrderArgs,
  context: ServiceContext<Clients>
) {
  console.log('=================')
  console.log('place order mutation')
  const { orderFormId } = await getSessionData(context)

  if (!orderFormId) throw new NotFoundError('order-form-not-found')

  const { clients } = context
  const { checkout, checkoutExtension } = clients

  const orderForm = await checkout.orderForm(orderFormId)

  checkoutExtension.setOrderFormId(orderFormId)

  const {
    paymentData,
    shippingData: { address: singleAddress },
    storePreferencesData,
    value,
  } = orderForm as OrderForm & {
    paymentData: PaymentData
  }

  const { installmentOptions, payments } = paymentData

  const [payment] = payments

  const installment = getFirstInstallmentByPaymentSystem(
    installmentOptions,
    payment?.paymentSystem
  )

  if (selectedCostCenters.length === 1) {
    const orderGroup = await process(singleAddress as Address)

    return [orderGroup]
  }

  const orderGroups: string[] = []

  for await (const costCenter of selectedCostCenters) {
    const orderGroup = await process(costCenter.address as Address)

    orderGroups.push(orderGroup)
  }

  return orderGroups

  async function process(address: Address) {
    if (!orderFormId) throw new NotFoundError('order-form-not-found')

    const orderFormUpdatePromises: Array<Promise<void>> = []

    console.log({ poNumber, invoiceData })

    if (poNumber) {
      orderFormUpdatePromises.push(
        checkout
          .setSingleCustomData(orderFormId, {
            appId: B2B_CHECKOUT_CUSTOM_APP_ID,
            appFieldName: PO_NUMBER_CUSTOM_FIELD,
            value: poNumber,
          })
          .catch((e) => {
            console.log('error on setSingleCustomData')
            throw e
          })
      )
    }

    if (invoiceData) {
      orderFormUpdatePromises.push(
        checkoutExtension.updateOrderFormInvoiceData(invoiceData).catch((e) => {
          console.log('error on updateOrderFormInvoiceData')

          throw e
        })
      )
    }

    await Promise.all(orderFormUpdatePromises)

    const startTransactionBody: TransactionBody = {
      referenceId: orderFormId,
      optinNewsLetter: true,
      savePersonalData: true,
      value: installment?.total ?? value,
      referenceValue: payment?.referenceValue,
      interestValue: installment?.interestRate,
    }

    console.log('starting transaction')

    const transactionResponse = await checkoutExtension
      .startTransaction(startTransactionBody)
      .catch((e) => {
        console.log('error on startTransaction')
        throw e
      })

    const {
      id: transactionId,
      orderGroup,
      messages: transactionMessages,
    } = transactionResponse

    console.log('transactionMessages:')
    console.log(transactionMessages)

    const transactionError = transactionMessages.find(
      (message) => message.status === 'error'
    )?.text

    if (transactionError) {
      throw new ResolverError(transactionError)
    }

    const paymentsBody: PaymentsBody = {
      paymentSystem: +(payment?.paymentSystem ?? 0),
      installments: payment?.installments,
      currencyCode: storePreferencesData?.currencyCode,
      value: payment?.value ?? value,
      installmentsInterestRate: installment?.interestRate ?? 0,
      installmentsValue: installment?.value ?? 0,
      referenceValue: payment?.referenceValue,
      isBillingAddressDifferent: invoiceData?.addressId !== address?.addressId,
      fields: {
        accountId: payment?.accountId,
        address: invoiceData ?? address,
      },
      transaction: {
        id: transactionId,
        merchantName:
          transactionResponse.merchantTransactions?.[0]?.merchantName,
      },
    }

    await checkoutExtension.setPayments(orderGroup, paymentsBody).catch((e) => {
      console.log('error on setPayments:', e.message)
      throw e
    })
    await checkoutExtension.gatewayCallback(orderGroup).catch((e) => {
      console.log('error on gatewayCallback')
      throw e
    })

    return orderGroup
  }
}
