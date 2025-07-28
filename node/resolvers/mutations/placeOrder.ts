import { NotFoundError, ResolverError, ServiceContext } from '@vtex/api'
import { Mutation, MutationPlaceOrderArgs } from 'ssesandbox04.checkout-b2b'

import { Clients } from '../../clients'
import { getFirstInstallmentByPaymentSystem, getSessionData } from '../../utils'
import { getAppSettings } from '../queries/getAppSettings'
import { saveRepresentativeBalance } from './saveRepresentativeBalance'

const B2B_CHECKOUT_CUSTOM_APP_ID = 'b2b-checkout-settings'
const PO_NUMBER_CUSTOM_FIELD = 'purchaseOrderNumber'

export async function placeOrder(
  _: unknown,
  {
    poNumber,
    invoiceData,
    selectedCostCenters,
    deliveryOptionsByCostCenter,
    defaultCostCenter,
  }: MutationPlaceOrderArgs,
  context: ServiceContext<Clients>
) {
  const { orderFormId, organizationId } = await getSessionData(context)

  if (!orderFormId) throw new NotFoundError('order-form-not-found')

  const { checkout, checkoutExtension } = context.clients
  const initialOrderForm = (await checkout.orderForm(orderFormId)) as OrderForm
  const {
    items,
    marketingData,
    shippingData: { logisticsInfo },
  } = initialOrderForm

  checkoutExtension.setOrderFormId(orderFormId)

  const orders: Mutation['placeOrder'] = []
  let lastError: Error | null = null

  for await (const costCenter of selectedCostCenters) {
    try {
      const order = await process(costCenter)

      orders.push(order)
    } catch (e) {
      lastError = e
    }
  }

  const resetCostCenter = defaultCostCenter as CostCenter
  const [defaultCostCenterAddress] = resetCostCenter.addresses
  const orderFormResetPromises = [
    checkoutExtension.updateOrderFormShipping({
      address: {
        ...defaultCostCenterAddress,
        geoCoordinates: defaultCostCenterAddress.geoCoordinates ?? [],
        isDisposable: true,
      },
    }),
    checkoutExtension.updateOrderFormMarketingData({
      attachmentId: 'marketingData',
      marketingTags: marketingData?.marketingTags ?? [],
      utmCampaign: organizationId,
      utmMedium: resetCostCenter.costId,
    }),
  ]

  await Promise.all(orderFormResetPromises)

  if (!orders.length && lastError) {
    throw lastError
  }

  return orders

  async function process({ costId, costCenterName, address }: CostCenter) {
    const optionsBySeller = deliveryOptionsByCostCenter[
      costCenterName
    ] as Record<string, { id: string }>

    const updatedLogisticsInfo = logisticsInfo.map((logisticsItem) => ({
      ...logisticsItem,
      selectedSla: optionsBySeller[items[logisticsItem.itemIndex].seller].id,
    }))

    const newAddress = {
      ...address,
      geoCoordinates: address.geoCoordinates ?? [],
      isDisposable: true,
    }

    const updatedOrderForm = await checkoutExtension.updateOrderFormShipping({
      address: newAddress,
      selectedAddresses: [newAddress],
      logisticsInfo: updatedLogisticsInfo,
    })

    const { paymentData, storePreferencesData, value } = updatedOrderForm
    const { installmentOptions, payments } = paymentData
    const [payment] = payments
    const installment = getFirstInstallmentByPaymentSystem(
      installmentOptions,
      payment?.paymentSystem
    )

    const orderFormUpdatePromises = [
      checkoutExtension.updateOrderFormMarketingData({
        attachmentId: 'marketingData',
        marketingTags: marketingData?.marketingTags ?? [],
        utmCampaign: organizationId,
        utmMedium: costId,
      }),
    ]

    if (poNumber) {
      orderFormUpdatePromises.push(
        checkout.setSingleCustomData(orderFormId as string, {
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
      referenceId: orderFormId as string,
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

    const settings = await getAppSettings(null, null, context)

    if (settings.representativeBalance?.enabled) {
      const hasManualPrice = initialOrderForm.items?.some(
        (item) => item.manualPrice && item.manualPrice !== item.price
      )

      if (hasManualPrice) {
        const discountTotalizer = initialOrderForm.totalizers?.find(
          (t) => t.id === 'Discounts'
        )

        const balanceDiff = (discountTotalizer?.value ?? 0) / 100

        if (balanceDiff) {
          await saveRepresentativeBalance(
            null,
            { balance: balanceDiff, orderGroup },
            context
          )
        }
      }
    }

    return {
      orderGroup,
      costId,
      costCenterName,
      value: payment?.value ?? value,
    }
  }
}
