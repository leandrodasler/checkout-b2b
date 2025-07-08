import { NotFoundError, ResolverError, ServiceContext } from '@vtex/api'
import { OrderForm } from '@vtex/clients'
import { MutationPlaceOrderArgs } from 'ssesandbox04.checkout-b2b'
import { PaymentData } from 'vtex.checkout-graphql'

import { Clients } from '../../clients'
import { getFirstInstallmentByPaymentSystem, getSessionData } from '../../utils'

const B2B_CHECKOUT_CUSTOM_APP_ID = 'b2b-checkout-settings'
const PO_NUMBER_CUSTOM_FIELD = 'purchaseOrderNumber'

export async function placeOrder(
  _: unknown,
  { poNumber, invoiceData, selectedCostCenters }: MutationPlaceOrderArgs,
  context: ServiceContext<Clients>
) {
  const { orderFormId, organizationId } = await getSessionData(context)

  if (!orderFormId) throw new NotFoundError('order-form-not-found')

  const { clients } = context
  const { checkout, checkoutExtension } = clients
  const orderForm = await checkout.orderForm(orderFormId)

  checkoutExtension.setOrderFormId(orderFormId)

  const {
    paymentData,
    storePreferencesData,
    value,
    marketingData,
  } = orderForm as OrderForm & {
    paymentData: PaymentData
  }

  const { installmentOptions, payments } = paymentData
  const [payment] = payments
  const installment = getFirstInstallmentByPaymentSystem(
    installmentOptions,
    payment?.paymentSystem
  )

  const orderGroups: string[] = []

  for await (const costCenter of selectedCostCenters) {
    const orderGroup = await process(costCenter)

    orderGroups.push(orderGroup)
  }

  return orderGroups

  async function process({ costId, address }: CostCenter) {
    if (!orderFormId) throw new NotFoundError('order-form-not-found')

    const orderFormUpdatePromises = [
      checkoutExtension.updateOrderFormShipping({
        address: {
          ...address,
          geoCoordinates: address.geoCoordinates ?? [],
          isDisposable: true,
        },
      }),
      checkoutExtension.updateOrderFormMarketingData({
        attachmentId: 'marketingData',
        marketingTags: marketingData?.marketingTags ?? [],
        utmCampaign: organizationId,
        utmMedium: costId,
      }),
    ]

    if (poNumber) {
      orderFormUpdatePromises.push(
        checkout.setSingleCustomData(orderFormId, {
          appId: B2B_CHECKOUT_CUSTOM_APP_ID,
          appFieldName: PO_NUMBER_CUSTOM_FIELD,
          value: poNumber,
        })
      )
    }

    if (invoiceData) {
      orderFormUpdatePromises.push(
        checkoutExtension.updateOrderFormInvoiceData(invoiceData)
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

    const transactionResponse = await checkoutExtension.startTransaction(
      startTransactionBody
    )

    const {
      id: transactionId,
      orderGroup,
      messages: transactionMessages,
    } = transactionResponse

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
      isBillingAddressDifferent:
        invoiceData?.address?.addressId !== address?.addressId,
      fields: {
        accountId: payment?.accountId,
        address: invoiceData?.address ?? address,
      },
      transaction: {
        id: transactionId,
        merchantName:
          transactionResponse.merchantTransactions?.[0]?.merchantName,
      },
    }

    await checkoutExtension.setPayments(orderGroup, paymentsBody)
    await checkoutExtension.gatewayCallback(orderGroup)

    return orderGroup
  }
}
