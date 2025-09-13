import { useMemo } from 'react'

import { compareCostCenters } from '../utils'
import { useOrganization } from './useOrganization'

const BACKGROUND_COLORS = [
  '#FFFACD',
  '#FFB6C1',
  '#B0E0E6',
  '#98FB98',
  '#FFDAB9',
  '#E6E6FA',
  '#F5DEB3',
  '#AFEEEE',
  '#D8BFD8',
  '#FFE4B5',
]

const MAX_COLORS = BACKGROUND_COLORS.length

export function useCostCenters() {
  const { organization } = useOrganization()
  const { id: organizationId, userCostCenters } = organization
  const costCenters = useMemo(
    () =>
      userCostCenters
        ?.filter((userCostCenter) => userCostCenter?.orgId === organizationId)
        ?.sort(compareCostCenters)
        ?.map((userCostCenter, index) => ({
          ...userCostCenter,
          color: BACKGROUND_COLORS[index % MAX_COLORS],
        })),
    [organizationId, userCostCenters]
  )

  return costCenters
}
