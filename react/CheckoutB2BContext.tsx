import React, { useCallback, useState } from 'react'
import { useQuery } from 'react-apollo'
import type {
  Query,
  QueryGetCartArgs,
  SavedCart,
} from 'ssesandbox04.checkout-b2b'
import type { Item } from 'vtex.checkout-graphql'
import { useRuntime } from 'vtex.render-runtime'
import { withToast } from 'vtex.styleguide'

import GET_SAVED_CART from './graphql/getSavedCart.graphql'
import type { CustomOrganization, WithToast } from './typings'

type QueryGetSavedCart = Pick<Query, 'getCart'>

type CheckoutB2BContextData = {
  pending: boolean
  setPending: React.Dispatch<React.SetStateAction<boolean>>
  showToast: WithToast['showToast']
  selectedCart?: SavedCart | null
  setSelectedCart: React.Dispatch<
    React.SetStateAction<SavedCart | null | undefined>
  >
  openSavedCartModal: boolean
  setOpenSavedCartModal: React.Dispatch<React.SetStateAction<boolean>>
  getSellingPrice: (item: Item, discount: number) => number
  getDiscountedPrice: (item: Item, discount: number) => number
  discountApplied: number
  setDiscountApplied: React.Dispatch<React.SetStateAction<number>>
  maximumDiscount?: number
  setMaximumDiscount: React.Dispatch<React.SetStateAction<number | undefined>>
  subtotal: number
  setSubtotal: React.Dispatch<React.SetStateAction<number>>
  listedPrice: number
  setListedPrice: React.Dispatch<React.SetStateAction<number>>
  percentualDiscount: number
  setPercentualDiscount: React.Dispatch<React.SetStateAction<number>>
  searchQuery: string
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>
  searchStore: boolean
  setSearchStore: React.Dispatch<React.SetStateAction<boolean>>
  selectedCostCenters: CustomOrganization['userCostCenters']
  setSelectedCostCenters: React.Dispatch<
    React.SetStateAction<CustomOrganization['userCostCenters']>
  >
  loadingShippingAddress: boolean
  setLoadingShippingAddress: React.Dispatch<React.SetStateAction<boolean>>
  poNumber?: string
  setPoNumber: React.Dispatch<React.SetStateAction<string | undefined>>
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
  const [poNumber, setPoNumber] = useState<string>()
  const [searchStore, setSearchStore] = useState(true)
  const [loadingShippingAddress, setLoadingShippingAddress] = useState(false)
  const [subtotal, setSubtotal] = useState(0)
  const [listedPrice, setListedPrice] = useState(0)
  const [percentualDiscount, setPercentualDiscount] = useState(0)
  const [maximumDiscount, setMaximumDiscount] = useState<number | undefined>(0)
  const [selectedCostCenters, setSelectedCostCenters] = useState<
    CustomOrganization['userCostCenters']
  >([])

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
    poNumber,
    setPoNumber,
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
