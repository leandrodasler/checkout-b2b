import React from 'react'

type CheckoutB2BContextData = {
  pending: boolean
  setPending: React.Dispatch<React.SetStateAction<boolean>>
}

const CheckoutB2BContext = React.createContext<CheckoutB2BContextData | null>(
  null
)

export function CheckoutB2BProvider({
  children,
}: React.PropsWithChildren<unknown>) {
  const [pending, setPending] = React.useState(false)

  return (
    <CheckoutB2BContext.Provider value={{ pending, setPending }}>
      {children}
    </CheckoutB2BContext.Provider>
  )
}

export function useCheckoutB2BContext() {
  const context = React.useContext(CheckoutB2BContext)

  if (!context) {
    throw new Error(
      'useCheckoutB2BContext must be used within a CheckoutB2BProvider'
    )
  }

  return context
}
