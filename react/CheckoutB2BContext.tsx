import { ApolloQueryResult } from 'apollo-client'
import React, { Dispatch, SetStateAction, useCallback, useState } from 'react'
import { useQuery } from 'react-apollo'
import type {
  Query,
  QueryGetCartArgs,
  SavedCart,
} from 'ssesandbox04.checkout-b2b'
import type { Item } from 'vtex.checkout-graphql'
import { withToast } from 'vtex.styleguide'

import CHECK_ORDER_FORM_CONFIGURATION from './graphql/checkOrderFormConfiguration.graphql'
import GET_SAVED_CART from './graphql/getSavedCart.graphql'
import { useOrderFormCustom } from './hooks'
import type { WithToast } from './typings'
import { CHECKOUT_B2B_CUSTOM_APP_ID } from './utils'

type QueryGetSavedCart = Pick<Query, 'getCart'>
type QueryCheckOrderFormConfiguration = Pick<
  Query,
  'checkOrderFormConfiguration'
>

type CheckoutB2BContextData = {
  pending: boolean
  setPending: Dispatch<SetStateAction<boolean>>
  showToast: WithToast['showToast']
  selectedCart?: SavedCart | null
  setSelectedCart: Dispatch<SetStateAction<SavedCart | null | undefined>>
  getSellingPrice: (item: Item, discount: number) => number
  getDiscountedPrice: (item: Item, discount: number) => number
  discountApplied: number
  setDiscountApplied: Dispatch<SetStateAction<number>>
  subtotal: number
  setSubtotal: Dispatch<SetStateAction<number>>
  listedPrice: number
  setListedPrice: Dispatch<SetStateAction<number>>
  percentualDiscount: number
  setPercentualDiscount: Dispatch<SetStateAction<number>>
  searchQuery: string
  setSearchQuery: Dispatch<SetStateAction<string>>
  searchStore: boolean
  setSearchStore: Dispatch<SetStateAction<boolean>>
  refetchCurrentSavedCart: (
    variables?: QueryGetCartArgs | undefined
  ) => Promise<ApolloQueryResult<QueryGetSavedCart>>
  loadingCurrentSavedCart: boolean
}

const CheckoutB2BContext = React.createContext<CheckoutB2BContextData | null>(
  null
)

function CheckoutB2BProviderWrapper({
  children,
  showToast,
}: React.PropsWithChildren<WithToast>) {
  const [pending, setPending] = useState(false)
  const [selectedCart, setSelectedCart] = useState<SavedCart | null>()
  const [discountApplied, setDiscountApplied] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchStore, setSearchStore] = useState(true)
  const [subtotal, setSubtotal] = useState(0)
  const [listedPrice, setListedPrice] = useState(0)
  const [percentualDiscount, setPercentualDiscount] = useState(0)

  const { orderForm } = useOrderFormCustom()

  const customApp = orderForm.customData?.customApps.find(
    (app) => app.id === CHECKOUT_B2B_CUSTOM_APP_ID
  )

  const savedCartId = customApp?.fields?.savedCart

  const {
    refetch: refetchCurrentSavedCart,
    loading: loadingCurrentSavedCart,
  } = useQuery<QueryGetSavedCart, QueryGetCartArgs>(GET_SAVED_CART, {
    ssr: false,
    skip: !savedCartId,
    fetchPolicy: 'network-only',
    variables: { id: savedCartId ?? '' },
    notifyOnNetworkStatusChange: true,
    onCompleted({ getCart }) {
      setSelectedCart(getCart)
    },
    onError() {
      setSelectedCart(null)
    },
  })

  useQuery<QueryCheckOrderFormConfiguration>(CHECK_ORDER_FORM_CONFIGURATION, {
    ssr: false,
  })

  const getSellingPrice = useCallback(
    (item: Item, discount: number): number => {
      if (!item.sellingPrice) return 0

      return discount > 0
        ? item.sellingPrice - (item.sellingPrice * discount) / 100
        : item.sellingPrice
    },
    []
  )

  const getDiscountedPrice = useCallback(
    (item: Item, discount: number): number => {
      const sellingPrice = getSellingPrice(item, discount)
      const quantity = item.quantity ?? 1

      return sellingPrice * quantity
    },
    [getSellingPrice]
  )

  const value = {
    pending,
    setPending,
    showToast,
    selectedCart,
    setSelectedCart,
    getSellingPrice,
    getDiscountedPrice,
    discountApplied,
    setDiscountApplied,
    subtotal,
    setSubtotal,
    listedPrice,
    setListedPrice,
    percentualDiscount,
    setPercentualDiscount,
    searchQuery,
    setSearchQuery,
    searchStore,
    setSearchStore,
    refetchCurrentSavedCart,
    loadingCurrentSavedCart,
  }

  return (
    <CheckoutB2BContext.Provider value={value}>
      {children}
    </CheckoutB2BContext.Provider>
  )
}

export const CheckoutB2BProvider = withToast(CheckoutB2BProviderWrapper)

export function useCheckoutB2BContext() {
  const context = React.useContext(CheckoutB2BContext)

  if (!context) {
    throw new Error(
      'useCheckoutB2BContext must be used within a CheckoutB2BProvider'
    )
  }

  return context
}
