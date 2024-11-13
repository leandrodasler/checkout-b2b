import React from 'react'

type CheckoutB2BContextData = {
  pending: boolean
  setPending: React.Dispatch<React.SetStateAction<boolean>>
}

const CheckoutB2BContext = React.createContext<CheckoutB2BContextData>({
  pending: false,
  setPending: () => {},
})

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
  return React.useContext(CheckoutB2BContext)
}
