import { IOContext, SegmentData } from '@vtex/api'
import { OrderForm as OrderFormType } from '@vtex/clients'
import { Address, PaymentData } from 'vtex.checkout-graphql'

declare global {
  type OrderForm = OrderFormType & { paymentData: PaymentData }

  type TransactionBody = {
    referenceId: string
    savePersonalData: boolean
    optinNewsLetter: boolean
    value: number
    referenceValue?: number | null
    interestValue?: number | null
  }

  type TransactionResponse = {
    id: string
    orderGroup: string
    merchantTransactions?: Array<{ merchantName: string }>
    messages: Array<{ text?: string; status?: string }>
  }

  type PaymentsBody = Partial<{
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

  type CustomIOContext = IOContext & {
    segment?: SegmentData
    orderFormId?: string
    ownerId?: string
  }

  type CostCenter = {
    costId: string
    costCenterName: string
    address: Address
    addresses: Address[]
  }

  type RepresentativeBalance = {
    id: string
    email: string
    balance: number
    createdIn: string
    lastInteractionIn: string
  }

  type AppSettings = {
    salesRepresentative: number
    salesManager: number
    salesAdmin: number
    rolesAllowedToSeeMargin: string[]
    representativeBalance?: {
      enabled: boolean
      openingBalance?: number
    }
  }
}
