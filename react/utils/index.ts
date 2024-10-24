import { Item, PaymentData } from 'vtex.checkout-graphql'

export * from './messages'

export const B2B_CUSTOM_APP_ID = 'b2b-checkout-settings'
export const B2B_CUSTOM_APP_MAJOR = 1
export const PO_NUMBER_CUSTOM_FIELD = 'purchaseOrderNumber'

export function normalizeString(str?: string | null) {
  return (
    str
      ?.normalize('NFD')
      .replace(/[\u0300-\u036f\s]/g, '')
      .toLowerCase() ?? ''
  )
}

export function isWithoutStock(item: Item) {
  return item.availability === 'withoutStock'
}

export function getFirstInstallmentByPaymentSystem(
  installmentOptions: PaymentData['installmentOptions'],
  paymentSystem?: string | null
) {
  const installmentOption = installmentOptions.find(
    (option) => option.paymentSystem === paymentSystem
  )

  return installmentOption?.installments[0]
}
