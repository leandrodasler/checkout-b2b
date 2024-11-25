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
    isBillingAddressDifferent: boolean
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
  'getOrganizationByIdStorefront' | 'getUsers' | 'getCostCenterByIdStorefront'
>

export type CustomOrganization = GetOrganizationQuery['getOrganizationByIdStorefront'] & {
  users: GetOrganizationQuery['getUsers']
  costCenter: GetOrganizationQuery['getCostCenterByIdStorefront']
}

type PaymentField<T> = {
  value: T
  disabled?: boolean
}

export type PaymentAddressType = {
  [K in keyof Address]: PaymentField<Address[K]>
}
