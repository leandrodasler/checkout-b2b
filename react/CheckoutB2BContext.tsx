import React from 'react'
import type { SavedCart } from 'ssesandbox04.checkout-b2b'
import { withToast } from 'vtex.styleguide'

import type { WithToast } from './typings'

type CheckoutB2BContextData = {
  pending: boolean
  setPending: React.Dispatch<React.SetStateAction<boolean>>
  showToast: WithToast['showToast']
  selectedCart?: SavedCart
  setSelectedCart: React.Dispatch<React.SetStateAction<SavedCart | undefined>>
}

const CheckoutB2BContext = React.createContext<CheckoutB2BContextData | null>(
  null
)

function CheckoutB2BProviderWrapper({
  children,
  showToast,
}: React.PropsWithChildren<WithToast>) {
  const [pending, setPending] = React.useState(false)
  const [selectedCart, setSelectedCart] = React.useState<SavedCart>()

  return (
    <CheckoutB2BContext.Provider
      value={{ pending, setPending, showToast, selectedCart, setSelectedCart }}
    >
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
