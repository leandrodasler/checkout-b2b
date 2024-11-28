import { useMemo } from 'react'

import { useOrganization } from './useOrganization'

export function usePermissions() {
  const { organization } = useOrganization()
  const { role } = organization

  const canViewMargin = useMemo(
    () =>
      !!role &&
      !['customer-admin', 'customer-approver', 'customer-buyer'].includes(role),
    [role]
  )

  return { canViewMargin }
}
