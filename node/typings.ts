import { IOContext, SegmentData } from '@vtex/api'
import { OrderForm as OrderFormType } from '@vtex/clients'
import { Address, PaymentData } from 'vtex.checkout-graphql'

declare global {
  type OrderForm = Omit<OrderFormType, 'items'> & {
    paymentData: PaymentData
    items: Array<
      OrderFormType['items'][number] & {
        manualPrice?: number
      }
    >
  }

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

  type MasterdataEntity<T> = {
    id: string
    createdIn: string
    lastInteractionIn: string
  } & T

  type RepresentativeBalance = MasterdataEntity<{
    email: string
    balance: number
  }>

  type RepresentativeBalanceTransaction = MasterdataEntity<{
    email: string
    oldBalance: number
    newBalance: number
    orderGroup: string
  }>

  type AppSettings = {
    salesRepresentative: number
    salesManager: number
    salesAdmin: number
    rolesAllowedToSeeMargin: string[]
    representativeBalance?: {
      enabled: boolean
      openingBalance?: number
      allowNegativeBalance?: boolean
    }
  }

  type B2BUser = {
    email: string
    name: string
    roleId: string
    orgId: string
    costId: string
  }

  type MailData = {
    templateName: string
    jsonData: MailJsonData
  }

  type MailJsonData = {
    message: {
      to: string
      subject: string
    }
    data: {
      title: string
      linkLabel: string
      linkHref: string
      sentByLabel: string
      userLabel: string
      sentByName: string
      sentByEmail: string
      roleLabel: string
      sentByRole: string
      organizationLabel: string
      sentByOrganization: string
      costCenterLabel: string
      sentByCostCenter: string
      footerLine1: string
      footerLine2: string
    }
  }

  type MailTemplate = {
    AccountId?: string
    AccountName?: string
    ApplicationId?: string
    Description?: string
    FriendlyName: string
    IsDefaultTemplate: boolean
    IsPersisted: boolean
    IsRemoved: boolean
    Name: string
    Type: string
    Templates: {
      email: {
        To: string
        CC?: string
        BCC?: string
        Subject: string
        Message: string
        Type: string
        ProviderId: string
        ProviderName?: string
        IsActive: boolean
        withError: boolean
      }
      sms: {
        Type: string
        ProviderId?: string
        ProviderName?: string
        IsActive: boolean
        withError: boolean
        Parameters: string[]
      }
    }
  }
}
