import { useQuery } from 'react-apollo'
import type { OrderForm as OrderFormType } from 'vtex.checkout-graphql'
import { OrderForm } from 'vtex.order-manager'
import type { OrderForm as OrderFormSeller, Query } from 'vtex.store-graphql'

import GET_ORDER_FORM_SELLERS from '../graphql/getOrderFormSellers.graphql'

const { useOrderForm } = OrderForm

type OrderFormQuery = Pick<Query, 'orderForm'>

type UseOrderFormReturn = {
  loading: boolean
  orderForm: OrderFormType & Pick<OrderFormSeller, 'sellers'>
  setOrderForm: (orderForm: OrderFormType) => void
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

  return {
    loading: loading || sellersLoading,
    orderForm: { ...orderForm, sellers },
    setOrderForm,
  }
}
