import { NotFoundError, ResolverError, ServiceContext } from '@vtex/api'
import { MutationPlaceOrderArgs } from 'ssesandbox04.checkout-b2b'

import { Clients } from '../../clients'
import {
  getFirstInstallmentByPaymentSystem,
  getSessionData,
  handleCheckoutApiError,
} from '../../utils'
import { getAppSettings } from '../queries/getAppSettings'
import { saveRepresentativeBalance } from './saveRepresentativeBalance'

const B2B_CHECKOUT_CUSTOM_APP_ID = 'b2b-checkout-settings'
const PO_NUMBER_CUSTOM_FIELD = 'purchaseOrderNumber'

export async function placeOrder(
  _: unknown,
  { poNumber, invoiceData }: MutationPlaceOrderArgs,
  context: ServiceContext<Clients>
) {
  const { orderFormId, roleId } = await getSessionData(context)

  if (!orderFormId) throw new NotFoundError('order-form-not-found')

  const { checkout, checkoutExtension } = context.clients

  checkoutExtension.setOrderFormId(orderFormId)
  const initialOrderForm = (await checkout.orderForm(orderFormId)) as OrderForm
  const { storePreferencesData, value } = initialOrderForm
  const { address } = initialOrderForm.shippingData
  const { installmentOptions, payments } = initialOrderForm.paymentData
  const [payment] = payments
  const installment = getFirstInstallmentByPaymentSystem(
    installmentOptions,
    payment?.paymentSystem
  )

  try {
    const orderFormUpdatePromises: Array<Promise<void>> = []

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

    if (roleId === 'sales-representative') {
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
            ).catch(() => null)
          }
        }
      }
    }

    return orderGroup
  } catch (e) {
    handleCheckoutApiError(e)
  }
}
