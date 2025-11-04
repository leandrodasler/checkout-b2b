import { useQuery } from 'react-apollo'
import { Query } from 'ssesandbox04.checkout-b2b'

import GET_REPRESENTATIVE_BALANCE_SETTINGS from '../../graphql/getRepresentativeBalanceSettings.graphql'

type RepresentativeBalanceSettingsQuery = Pick<Query, 'getAppSettings'>

export function useRepresentativeBalanceSettings() {
  const { data, loading } = useQuery<RepresentativeBalanceSettingsQuery>(
    GET_REPRESENTATIVE_BALANCE_SETTINGS,
    {
      notifyOnNetworkStatusChange: true,
      ssr: false,
    }
  )

  const representativeBalanceEnabled =
    data?.getAppSettings.representativeBalance.enabled ?? false

  const allowNegativeBalance =
    data?.getAppSettings.representativeBalance.allowNegativeBalance ?? false

  const openingBalance =
    data?.getAppSettings.representativeBalance.openingBalance ?? 0

  return {
    loading,
    representativeBalanceEnabled,
    allowNegativeBalance,
    openingBalance,
  }
}
