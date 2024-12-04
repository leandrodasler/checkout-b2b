import { useMemo } from 'react'

import { useOrganization } from '.'

export function usePermissions() {
  const { organization } = useOrganization()
  const { role } = organization

  const isSalesUser = useMemo(
    () =>
      !!role &&
      !['customer-admin', 'customer-approver', 'customer-buyer'].includes(role),
    [role]
  )

  return { isSalesUser }
}
