import { useMemo } from 'react'

import { useOrganization } from '.'

interface AppSettings {
  salesRepresentative: number
  salesManager: number
  salesAdmin: number
}

export function usePermissions(appSettings?: AppSettings | undefined) {
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

  return { isSalesUser, maximumDiscount }
}
