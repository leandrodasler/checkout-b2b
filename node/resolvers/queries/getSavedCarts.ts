import { ServiceContext } from '@vtex/api'
import type { QueryGetSavedCartsArgs } from 'ssesandbox04.checkout-b2b'

import { Clients } from '../../clients'
import { getAllSavedCarts, getSessionData } from '../../utils'

export const getSavedCarts = async (
  _: unknown,
  { parentCartId, getAll }: QueryGetSavedCartsArgs,
  context: ServiceContext<Clients>
) => {
  const { organizationId, costCenterId } = await getSessionData(context)

  const where: string[] = []

  where.push(`(organizationId='${organizationId}')`)
  where.push(`(costCenterId='${costCenterId}')`)

  if (parentCartId) {
    where.push(`(parentCartId='${parentCartId}')`)
  } else if (!getAll) {
    where.push(`(parentCartId is null)`)
  }

  return getAllSavedCarts({
    context,
    where: where.join(' AND '),
    sort: `createdIn ${parentCartId || getAll ? 'ASC' : 'DESC'}`,
  })
}
