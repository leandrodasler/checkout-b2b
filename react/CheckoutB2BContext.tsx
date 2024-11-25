import React, { useCallback, useMemo } from 'react'
import type { Item } from 'vtex.checkout-graphql'

type CheckoutB2BContextData = {
  pending: boolean
  setPending: React.Dispatch<React.SetStateAction<boolean>>
  getSellingPrice: (item: Item, discount: number) => number
  getDiscountedPrice: (item: Item, discount: number) => number
}

const CheckoutB2BContext = React.createContext<CheckoutB2BContextData>({
  pending: false,
  setPending: () => {},
  getSellingPrice: () => 0,
  getDiscountedPrice: () => 0,
})

export function CheckoutB2BProvider({
  children,
}: React.PropsWithChildren<unknown>) {
  const [pending, setPending] = React.useState(false)

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
      getSellingPrice,
      getDiscountedPrice,
    }),
    [pending, getSellingPrice, getDiscountedPrice]
  )

  return (
    <CheckoutB2BContext.Provider value={value}>
      {children}
    </CheckoutB2BContext.Provider>
  )
}

export function useCheckoutB2BContext() {
  return React.useContext(CheckoutB2BContext)
}
