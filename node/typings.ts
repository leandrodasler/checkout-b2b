import { Address } from 'vtex.checkout-graphql'

declare global {
  type TransactionBody = {
    referenceId: string
    savePersonalData: boolean
    optinNewsLetter: boolean
    value: number
    referenceValue?: number | null
    interestValue?: number | null
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
}
