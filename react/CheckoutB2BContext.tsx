import React, { useCallback, useMemo, useState } from 'react'
import type { SavedCart } from 'ssesandbox04.checkout-b2b'
import type { Item } from 'vtex.checkout-graphql'
import { withToast } from 'vtex.styleguide'

import type { WithToast } from './typings'

type CheckoutB2BContextData = {
  pending: boolean
  setPending: React.Dispatch<React.SetStateAction<boolean>>
  showToast: WithToast['showToast']
  selectedCart?: SavedCart
  setSelectedCart: React.Dispatch<React.SetStateAction<SavedCart | undefined>>
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
}

const CheckoutB2BContext = React.createContext<CheckoutB2BContextData | null>(
  null
)

function CheckoutB2BProviderWrapper({
  children,
  showToast,
}: React.PropsWithChildren<WithToast>) {
  const [pending, setPending] = useState(false)
  const [selectedCart, setSelectedCart] = useState<SavedCart>()
  const [discountApplied, setDiscountApplied] = useState(0)

  const [subtotal, setSubtotal] = useState(0)
  const [listedPrice, setListedPrice] = useState(0)
  const [percentualDiscount, setPercentualDiscount] = useState(0)
  const [maximumDiscount, setMaximumDiscount] = useState<number | undefined>(0)
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

  const value = useMemo(
    () => ({
      pending,
      setPending,
      showToast,
      selectedCart,
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
    }),
    [
      pending,
      setPending,
      showToast,
      selectedCart,
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
    ]
  )

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
