import { useMemo } from 'react'

import { compareCostCenters } from '../utils'
import { useOrganization } from './useOrganization'

export function useCostCenters() {
  const { organization } = useOrganization()
  const { id: organizationId, userCostCenters } = organization
  const costCenters = useMemo(
    () =>
      userCostCenters
        ?.filter((userCostCenter) => userCostCenter?.orgId === organizationId)
        ?.sort(compareCostCenters),
    [organizationId, userCostCenters]
  )

  return costCenters
}
