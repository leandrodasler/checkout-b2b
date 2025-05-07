import { useMemo } from 'react'
import { useQuery } from 'react-apollo'
import { Query } from 'ssesandbox04.checkout-b2b'

import { useOrganization } from '.'
import GET_APP_SETTINGS from '../graphql/getAppSettings.graphql'

type AppSettingsQuery = Pick<Query, 'getAppSettings'>

interface AppSettings {
  salesRepresentative: number
  salesManager: number
  salesAdmin: number
  rolesAllowedToSeeMargin?: string[]
}

export function usePermissions() {
  const { data } = useQuery<AppSettingsQuery>(GET_APP_SETTINGS, {
    ssr: false,
  })

  const appSettings = data?.getAppSettings as AppSettings

  const { organization } = useOrganization()
  const { role } = organization

  const isSalesUser = useMemo(
    () =>
      !!role &&
      !['customer-admin', 'customer-approver', 'customer-buyer'].includes(role),
    [role]
  )

  const maximumDiscount = useMemo(() => {
    if (!appSettings) return 0

    const { salesAdmin, salesManager, salesRepresentative } = appSettings

    switch (role) {
      case 'sales-admin':
        return salesAdmin

      case 'sales-manager':
        return salesManager

      case 'sales-representative':
        return salesRepresentative

      default:
        return 0
    }
  }, [appSettings, role])

  const canSeeMargin = useMemo(
    () => appSettings?.rolesAllowedToSeeMargin?.includes(role) ?? false,
    [appSettings, role]
  )

  return { isSalesUser, maximumDiscount, canSeeMargin }
}
