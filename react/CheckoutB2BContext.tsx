import React, { Dispatch, SetStateAction, useCallback, useState } from 'react'
import { useQuery } from 'react-apollo'
import type {
  Mutation,
  Query,
  QueryGetCartArgs,
  SavedCart,
} from 'ssesandbox04.checkout-b2b'
import type { Item } from 'vtex.checkout-graphql'
import { useRuntime } from 'vtex.render-runtime'
import { ShippingSla } from 'vtex.store-graphql'
import { withToast } from 'vtex.styleguide'

import GET_SAVED_CART from './graphql/getSavedCart.graphql'
import type { CustomOrganization, WithToast } from './typings'

type QueryGetSavedCart = Pick<Query, 'getCart'>

type CheckoutB2BContextData = {
  pending: boolean
  setPending: Dispatch<SetStateAction<boolean>>
  showToast: WithToast['showToast']
  selectedCart?: SavedCart | null
  setSelectedCart: Dispatch<SetStateAction<SavedCart | null | undefined>>
  openSavedCartModal: boolean
  setOpenSavedCartModal: Dispatch<SetStateAction<boolean>>
  getSellingPrice: (item: Item, discount: number) => number
  getDiscountedPrice: (item: Item, discount: number) => number
  discountApplied: number
  setDiscountApplied: Dispatch<SetStateAction<number>>
  maximumDiscount?: number
  setMaximumDiscount: Dispatch<SetStateAction<number | undefined>>
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
  selectedCostCenters: CustomOrganization['userCostCenters']
  setSelectedCostCenters: Dispatch<
    SetStateAction<CustomOrganization['userCostCenters']>
  >
  loadingShippingAddress: boolean
  setLoadingShippingAddress: Dispatch<SetStateAction<boolean>>
  orderGroups?: Mutation['placeOrder']
  setOrderGroups: Dispatch<SetStateAction<Mutation['placeOrder'] | undefined>>
  deliveryOptionsByCostCenter: Record<string, Record<string, ShippingSla>>
  setDeliveryOptionsByCostCenter: Dispatch<
    SetStateAction<Record<string, Record<string, ShippingSla>>>
  >
  loadingGetShipping: boolean
  setLoadingGetShipping: Dispatch<SetStateAction<boolean>>
}

const CheckoutB2BContext = React.createContext<CheckoutB2BContextData | null>(
  null
)

function CheckoutB2BProviderWrapper({
  children,
  showToast,
}: React.PropsWithChildren<WithToast>) {
  const { query, setQuery } = useRuntime()
  const [pending, setPending] = useState(false)
  const [selectedCart, setSelectedCart] = useState<SavedCart | null>()
  const [openSavedCartModal, setOpenSavedCartModal] = useState(false)
  const [discountApplied, setDiscountApplied] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchStore, setSearchStore] = useState(true)
  const [loadingShippingAddress, setLoadingShippingAddress] = useState(false)
  const [loadingGetShipping, setLoadingGetShipping] = useState(false)
  const [subtotal, setSubtotal] = useState(0)
  const [listedPrice, setListedPrice] = useState(0)
  const [percentualDiscount, setPercentualDiscount] = useState(0)
  const [maximumDiscount, setMaximumDiscount] = useState<number | undefined>(0)
  const [selectedCostCenters, setSelectedCostCenters] = useState<
    CustomOrganization['userCostCenters']
  >([])

  const [orderGroups, setOrderGroups] = useState<Mutation['placeOrder']>()
  const [
    deliveryOptionsByCostCenter,
    setDeliveryOptionsByCostCenter,
  ] = useState<Record<string, Record<string, ShippingSla>>>({})

  const savedCartId = query?.savedCart

  useQuery<QueryGetSavedCart, QueryGetCartArgs>(GET_SAVED_CART, {
    ssr: false,
    skip: !savedCartId || selectedCart?.id === savedCartId,
    variables: { id: savedCartId ?? '' },
    onCompleted({ getCart }) {
      setSelectedCart(getCart)
    },
    onError() {
      setSelectedCart(null)
      setQuery({ savedCart: undefined })
    },
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
    openSavedCartModal,
    setOpenSavedCartModal,
    setSelectedCart,
    getSellingPrice,
    getDiscountedPrice,
    discountApplied,
    setDiscountApplied,
    maximumDiscount,
    setMaximumDiscount,
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
    selectedCostCenters,
    setSelectedCostCenters,
    loadingShippingAddress,
    setLoadingShippingAddress,
    orderGroups,
    setOrderGroups,
    deliveryOptionsByCostCenter,
    setDeliveryOptionsByCostCenter,
    loadingGetShipping,
    setLoadingGetShipping,
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
