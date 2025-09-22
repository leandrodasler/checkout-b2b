import { useCheckoutB2BContext } from '../CheckoutB2BContext'

export function useToast() {
  const { showToast } = useCheckoutB2BContext()

  const customShowToast: typeof showToast = (args) => {
    showToast({
      ...args,
      message: args.message.replace(/GraphQL error:\s*/gi, ''),
    })
  }

  return customShowToast
}
