import type { Query } from 'vtex.b2b-organizations-graphql'
import type { Address } from 'vtex.checkout-graphql'

type ShowToastArgs = {
  message: string
  horizontalPosition?: 'left' | 'right'
}

export type WithToast<T = unknown> = T & {
  showToast?: (args: ShowToastArgs) => void
}

export type TableSchema<RowType> = {
  properties: {
    [key in keyof RowType]?: {
      title: React.ReactNode
      width?: number
      minWidth?: number
      cellRenderer: (args: {
        cellData: RowType[key]
        rowData: RowType
      }) => React.ReactNode
    }
  }
}

export type ApiResponse = {
  code?: string
  message?: string
  response?: { data?: { error?: string } | string }
  error?: { message?: string }
}

export type TransactionResponse = ApiResponse & {
  id: string
  orderGroup: string
  merchantTransactions?: Array<{ merchantName: string }>
  messages: Array<{ text?: string }>
}

export type TransactionBody = {
  referenceId: string
  savePersonalData: boolean
  optinNewsLetter: boolean
  value: number
  referenceValue?: number | null
  interestValue?: number | null
}

export type PaymentsBody = Array<
  Partial<{
    paymentSystem: number | null
    installments: number | null
    currencyCode: string | null
    value: number
    installmentsInterestRate: number
    installmentsValue: number
    referenceValue: number | null
    fields: Partial<{
      holderName: string
      cardNumber: string
      validationCode: string
      dueDate: string
      document: string
      accountId: string | null
      address: Address | null
      callbackUrl: string
    }>
    transaction: {
      id: string
      merchantName?: string
    }
  }>
>

export type SessionOrganizationData = {
  organization: { value: string }
  costcenter: { value: string }
}

export type GetOrganizationQuery = Pick<
  Query,
  'getOrganizationByIdStorefront' | 'getUsers'
>

export type CustomOrganization = GetOrganizationQuery['getOrganizationByIdStorefront'] & {
  users: GetOrganizationQuery['getUsers']
}

export type PaymentAddresType = {
  addressId: { value: Address['addressId']; disabled?: boolean }
  city: { value: Address['city']; disabled?: boolean }
  complement: { value: Address['complement']; disabled?: boolean }
  country: { value: Address['country']; disabled?: boolean }
  neighborhood: { value: Address['neighborhood']; disabled?: boolean }
  number: { value: Address['number']; disabled?: boolean }
  postalCode: { value: Address['postalCode']; disabled?: boolean }
  geoCoordinates: { value: Address['geoCoordinates']; disabled?: boolean }
  receiverName: { value: Address['receiverName']; disabled?: boolean }
  reference: { value: Address['reference']; disabled?: boolean }
  state: { value: Address['state']; disabled?: boolean }
  street: { value: Address['street']; disabled?: boolean }
}
