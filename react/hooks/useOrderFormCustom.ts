import { useQuery } from 'react-apollo'
import { OrderForm } from 'vtex.order-manager'
import type {
  OrderForm as OrderFormType,
  Address,
  Maybe,
} from 'vtex.checkout-graphql'
import type { OrderForm as OrderFormSeller, Query } from 'vtex.store-graphql'

import GET_ORDER_FORM_SELLERS from '../graphql/getOrderFormSellers.graphql'

const { useOrderForm } = OrderForm

type OrderFormQuery = Pick<Query, 'orderForm'>

type PaymentAddress = {
  paymentAddress?: Maybe<Address> | undefined
}

export type UseOrderFormReturn = {
  loading: boolean
  orderForm: OrderFormType & Pick<OrderFormSeller, 'sellers'> & PaymentAddress
  setOrderForm: (orderForm: OrderFormType & PaymentAddress) => void
}

export function useOrderFormCustom() {
  const { data, loading: sellersLoading } = useQuery<OrderFormQuery>(
    GET_ORDER_FORM_SELLERS,
    {
      ssr: false,
    }
  )

  const sellers = data?.orderForm?.sellers

  const {
    orderForm,
    loading,
    setOrderForm,
  } = useOrderForm() as UseOrderFormReturn

  const { paymentAddress = orderForm?.shipping?.selectedAddress } = orderForm

  return {
    loading: loading || sellersLoading,
    orderForm: { ...orderForm, sellers, paymentAddress },
    setOrderForm,
  }
}
