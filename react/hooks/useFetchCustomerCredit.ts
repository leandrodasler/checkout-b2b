import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { useOrderFormCustom, useOrganization, useToast } from '.'
import { apiRequest } from '../services'
import type { ApiResponse } from '../typings'

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
  enabled?: boolean
}

export function useFetchCustomerCredit({ enabled = true }: Options) {
  const showToast = useToast()
  const { organization } = useOrganization()

  const {
    orderForm: { items, clientProfileData },
  } = useOrderFormCustom()

  const email = clientProfileData?.email
    ? encodeURIComponent(clientProfileData.email)
    : ''

  const salesChannel = organization?.salesChannel ?? ''
  const skus = useMemo(() => items.map((item) => item.id).join(','), [items])

  const url = `/api/creditcontrol/purchase-conditions?email=${email}&sc=${salesChannel}&skus=${skus}`

  return useQuery<Response, Error>({
    queryKey: ['fetchCustomerCredit', email, skus, salesChannel],
    queryFn: () => apiRequest<Response>(url, 'GET'),
    enabled,
    onError: showToast,
  })
}
