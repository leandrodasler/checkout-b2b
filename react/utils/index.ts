import { Item, Maybe, PaymentData } from 'vtex.checkout-graphql'

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

type AddressData = {
  [key: string]: {
    value:
      | string
      | number[]
      | number
      | null
      | undefined
      | Array<Maybe<number>>
      | boolean
  }
}

type ExtractedValues = {
  [key: string]:
    | string
    | number[]
    | number
    | null
    | undefined
    | Array<Maybe<number>>
    | boolean
}

export function extractAddressValues(data: AddressData): ExtractedValues {
  const extractedValues: ExtractedValues = {}

  for (const key in data) {
    if (data[key].value !== undefined && data[key].value !== null) {
      extractedValues[key] = data[key].value
    }
  }

  return extractedValues
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
