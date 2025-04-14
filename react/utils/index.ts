import { Address, Item, PaymentData } from 'vtex.checkout-graphql'

import { PaymentAddressType } from '../typings'

export * from './messages'

export const SESSION_NAMESPACE = 'storefront-permissions'
export const NAMESPACE_ITEMS = ['organization', 'costcenter']
export const B2B_QUOTES_CUSTOM_APP_ID = 'b2b-quotes-graphql'
export const B2B_CHECKOUT_CUSTOM_APP_ID = 'b2b-checkout-settings'
export const B2B_CHECKOUT_CUSTOM_APP_MAJOR = 1
export const PO_NUMBER_CUSTOM_FIELD = 'purchaseOrderNumber'
export const CUSTOMER_CREDIT_ID = '64'
export const SEARCH_TYPE = { CART: 0, STORE: 1 }

export function removeAccents(str?: string | null) {
  return (
    str
      ?.normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim() ?? ''
  )
}

export function normalizeString(str?: string | null) {
  return removeAccents(str)?.replace(/\s/g, '') ?? ''
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

export function toggleAddress(
  data: PaymentAddressType,
  enabled: boolean
): PaymentAddressType {
  const newAddresss = { ...data }

  for (const key in newAddresss) {
    const field = newAddresss[key as keyof PaymentAddressType]

    if (field) {
      field.disabled = !enabled
    }
  }

  return newAddresss
}

export const getEmptyAddress = (country: string) => {
  return {
    addressId: '0',
    addressType: 'commercial',
    city: null,
    complement: null,
    country,
    receiverName: '',
    geoCoordinates: [],
    neighborhood: null,
    number: null,
    postalCode: null,
    reference: null,
    state: null,
    street: null,
    addressQuery: null,
  }
}

export const buildBillingAddress = (
  newAddress?: Address | null,
  shippingAddress?: Address | null
) => ({
  ...newAddress,
  addressId: newAddress?.addressId ?? '0',
  addressQuery: null,
  addressType: 'commercial',
  receiverName: newAddress?.receiverName ?? shippingAddress?.receiverName ?? '',
})

export function transformImageUrl(
  url: string,
  width: number,
  height: string | number = 'auto'
) {
  const idMatch = url.match(/ids\/(\d+)\/.*?(\.\w+)(?:\?.*)?$/)

  if (!idMatch) {
    return url
  }

  return url
    .replace(/ids\/\d+/, `ids/${idMatch[1]}-${width}-${height}`)
    .replace(/\?.*$/, '')
}

export function welcome() {
  console.info(`

=========================================
WELCOME TO CHECKOUT B2B | VERSION: ${process.env.VTEX_APP_VERSION}
=========================================

`)
}

export const ERROR_TO_RETRY_PATTERNS = [
  'unhealthy',
  'genericerror',
  'network error',
  'networkerror',
  '429',
  '500',
  '502',
  '503',
]
