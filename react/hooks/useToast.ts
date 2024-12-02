import { useCheckoutB2BContext } from '../CheckoutB2BContext'

export function useToast() {
  const { showToast } = useCheckoutB2BContext()

  return showToast
}
