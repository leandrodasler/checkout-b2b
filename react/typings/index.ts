import type { Query as CheckoutB2BQuery } from 'ssesandbox04.checkout-b2b'
import type {
  Address as OrganizationAddress,
  Query,
} from 'vtex.b2b-organizations-graphql'
import type {
  Address,
  Maybe,
  OrderForm as OrderFormType,
} from 'vtex.checkout-graphql'
import type { OrderForm as OrderFormStore } from 'vtex.store-graphql'

type ShowToastArgs = {
  message: string
  horizontalPosition?: 'left' | 'right'
}

export type WithToast<T = unknown> = T & {
  showToast: (args: ShowToastArgs) => void
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

export type CustomItem = OrderFormType['items'][number] & { tax?: number }

export type CompleteOrderFormData = ApiResponse &
  Pick<OrderFormStore, 'sellers'> & {
    orderFormId: string
    invoiceData?: { address?: Maybe<Address> }
    clientProfileData: OrderFormStore['clientProfileData'] & {
      profileCompleteOnLoading?: string | null
      profileErrorOnLoading?: string | null
      customerClass?: string | null
    }
    items: CustomItem[]
  }

export type PaymentAddress = {
  paymentAddress?: Maybe<Address>
}

export type CompleteOrderForm = OrderFormType &
  PaymentAddress &
  CompleteOrderFormData

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
  | 'getOrganizationByIdStorefront'
  | 'getCostCenterByIdStorefront'
  | 'getUsers'
  | 'getActiveOrganizationsByEmail'
  | 'getCostCentersByOrganizationId'
>

export type CustomOrganization = GetOrganizationQuery['getOrganizationByIdStorefront'] & {
  users: GetOrganizationQuery['getUsers']
  costCenter: GetOrganizationQuery['getCostCenterByIdStorefront']
  userCostCenters?: Array<
    NonNullable<
      GetOrganizationQuery['getActiveOrganizationsByEmail']
    >[number] & {
      address?: OrganizationAddress | null
    }
  >
  role: string
  roleName: string
}

type PaymentField<T> = {
  value: T
  disabled?: boolean
}

export type PaymentAddressType = {
  [K in keyof Address]: PaymentField<Address[K]>
}

export type ModalProps = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export type GetSavedCartsQuery = Pick<CheckoutB2BQuery, 'getSavedCarts'>

export type Tax = { idCalculatorConfiguration: string; name: string }

export type OrderGroup = {
  costCenter: string
  orderGroup: string
}
