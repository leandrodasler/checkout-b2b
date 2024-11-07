import { useEffect, useState } from 'react'
import { useQuery } from 'react-apollo'
import type { OrderForm as OrderFormType } from 'vtex.checkout-graphql'
import { OrderForm } from 'vtex.order-manager'
import type {
  Query,
  Address,
  OrderForm as OrderFormSeller,
} from 'vtex.store-graphql'

import GET_ORDER_FORM_SELLERS from '../graphql/getOrderFormSellers.graphql'

const { useOrderForm } = OrderForm

type OrderFormQuery = Pick<Query, 'orderForm'>

type PaymentAddress = {
  paymentAddress?: Address | null
}

export type UseOrderFormReturn = {
  loading: boolean
  orderForm: OrderFormType & Pick<OrderFormSeller, 'sellers'> & PaymentAddress
  setOrderForm: (orderForm: OrderFormType & PaymentAddress) => void
}

export function useOrderFormCustom() {
  const [paymentAddress, setPaymentAddress] = useState<Address | null>(null)

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

  useEffect(() => {
    if (orderForm?.shipping?.selectedAddress) {
      setPaymentAddress(orderForm.shipping.selectedAddress)
    }
  }, [orderForm])

  return {
    loading: loading || sellersLoading,
    orderForm: { ...orderForm, sellers, paymentAddress },
    setOrderForm,
  }
}
