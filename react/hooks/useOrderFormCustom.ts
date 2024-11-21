import { useQuery } from '@tanstack/react-query'
import type {
  Address,
  Maybe,
  OrderForm as OrderFormType,
} from 'vtex.checkout-graphql'
import { OrderForm } from 'vtex.order-manager'
import type { OrderForm as OrderFormStore } from 'vtex.store-graphql'

import { apiRequest } from '../services'
import type { ApiResponse } from '../typings'

const { useOrderForm } = OrderForm

type InvoiceAndSellersData = ApiResponse &
  Pick<OrderFormStore, 'sellers'> & {
    invoiceData?: { address?: Maybe<Address> }
  }

type PaymentAddress = {
  paymentAddress?: Maybe<Address>
}

type CompleteOrderForm = OrderFormType & PaymentAddress & InvoiceAndSellersData

export type UseOrderFormReturn = {
  loading: boolean
  orderForm: CompleteOrderForm
  setOrderForm: (orderForm: CompleteOrderForm) => void
}

export function useOrderFormCustom() {
  const { data, isLoading } = useQuery<InvoiceAndSellersData, Error>({
    queryKey: ['invoiceData'],
    queryFn: () =>
      apiRequest<InvoiceAndSellersData>(`/api/checkout/pub/orderForm`, 'GET'),
  })

  const {
    orderForm,
    loading,
    setOrderForm,
  } = useOrderForm() as UseOrderFormReturn

  const invoiceAddress = data?.invoiceData?.address
  const shippingAddress = orderForm?.shipping?.selectedAddress

  const isInvoiceSameAsShipping =
    (invoiceAddress?.city ?? '') === (shippingAddress?.city ?? '') &&
    (invoiceAddress?.state ?? '') === (shippingAddress?.state ?? '') &&
    (invoiceAddress?.country ?? '') === (shippingAddress?.country ?? '') &&
    (invoiceAddress?.street ?? '') === (shippingAddress?.street ?? '') &&
    (invoiceAddress?.number ?? '') === (shippingAddress?.number ?? '') &&
    (invoiceAddress?.complement ?? '') ===
      (shippingAddress?.complement ?? '') &&
    (invoiceAddress?.neighborhood ?? '') ===
      (shippingAddress?.neighborhood ?? '') &&
    (invoiceAddress?.postalCode ?? '') === (shippingAddress?.postalCode ?? '')

  const {
    paymentAddress = invoiceAddress && isInvoiceSameAsShipping
      ? shippingAddress
      : invoiceAddress,
  } = orderForm

  return {
    loading: loading || isLoading,
    orderForm: { ...data, ...orderForm, paymentAddress },
    setOrderForm,
  }
}
