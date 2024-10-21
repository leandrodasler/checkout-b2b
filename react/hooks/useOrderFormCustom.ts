import type { OrderForm as OrderFormType } from 'vtex.checkout-graphql'
import { OrderForm } from 'vtex.order-manager'

const { useOrderForm } = OrderForm

type UseOrderFormReturn = {
  loading: boolean
  orderForm: OrderFormType
  setOrderForm: (orderForm: OrderFormType) => void
}

export function useOrderFormCustom() {
  return useOrderForm() as UseOrderFormReturn
}
