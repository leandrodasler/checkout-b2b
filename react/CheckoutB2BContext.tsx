import React, { useCallback, useMemo, useState } from 'react'
import type { Item } from 'vtex.checkout-graphql'
import { withToast } from 'vtex.styleguide'

import type { WithToast } from './typings'

type CheckoutB2BContextData = {
  pending: boolean
  setPending: React.Dispatch<React.SetStateAction<boolean>>
  showToast: WithToast['showToast']
  getSellingPrice: (item: Item, discount: number) => number
  getDiscountedPrice: (item: Item, discount: number) => number
  discountApplied: number // Variável adicionada ao contexto
  setDiscountApplied: React.Dispatch<React.SetStateAction<number>>
  fixedDiscountPercentage: number // Variável adicionada ao contexto
  setFixedDiscountPercentage: React.Dispatch<React.SetStateAction<number>>
}

const CheckoutB2BContext = React.createContext<CheckoutB2BContextData | null>(
  null
)

function CheckoutB2BProviderWrapper({
  children,
  showToast,
}: React.PropsWithChildren<WithToast>) {
  const [pending, setPending] = React.useState(false)
  const [discountApplied, setDiscountApplied] = useState(0) // Estado para controlar o desconto aplicado
  const [fixedDiscountPercentage, setFixedDiscountPercentage] = useState(0)

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
      getSellingPrice,
      getDiscountedPrice,
      discountApplied, // Adiciona ao valor do contexto
      setDiscountApplied, // Função para atualizar o desconto
      fixedDiscountPercentage, // Adiciona ao contexto
      setFixedDiscountPercentage, // Adiciona função para atualizar
    }),
    [
      pending,
      setPending,
      showToast,
      getSellingPrice,
      getDiscountedPrice,
      discountApplied,
      setDiscountApplied,
      fixedDiscountPercentage,
      setFixedDiscountPercentage,
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
