import { useQuery } from '@tanstack/react-query'

import { apiRequest } from '../services'
import type { ApiResponse } from '../typings'
import { useToast } from './useToast'

interface Response extends ApiResponse {
  accountId: string
  availableCredit: number
  deadlines: Array<{
    paymentOptions: number[]
    interestRate: number
    minInstallmentValue: number
  }>
}

interface Options {
  email: string
  skus: string
  salesChannel: string
}

export function useFetchCustomerCredit({ email, skus, salesChannel }: Options) {
  const showToast = useToast()

  const url = `/api/creditcontrol/purchase-conditions?email=${email}&sc=${salesChannel}&skus=${skus}`

  return useQuery<Response, Error>({
    queryKey: ['fetchCustomerCredit', email, skus, salesChannel],
    queryFn: () => apiRequest<Response>(url, 'GET'),
    onError: (error) => {
      showToast({ message: error.message })
      console.error(`Error fetching Customer Credit: ${error.message}`)
    },
  })
}
