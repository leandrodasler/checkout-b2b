import { ServiceContext } from '@vtex/api'
import type { SavedCart } from 'ssesandbox04.checkout-b2b'

import { Clients } from '../../clients'
import {
  getSessionData,
  SAVED_CART_ENTITY,
  SAVED_CART_FIELDS,
  SAVED_CART_SCHEMA_VERSION,
  saveSchemas,
} from '../../utils'

export const getSavedCarts = async (
  _: unknown,
  __: unknown,
  context: ServiceContext<Clients>
) => {
  const { organizationId, costCenterId } = await getSessionData(context)

  await saveSchemas(context)

  const { clients } = context
  const savedCarts = await clients.masterdata.searchDocuments<SavedCart>({
    schema: SAVED_CART_SCHEMA_VERSION,
    dataEntity: SAVED_CART_ENTITY,
    fields: SAVED_CART_FIELDS,
    pagination: {
      page: 1,
      pageSize: 100,
    },
    where: `(organizationId='${organizationId}') AND (costCenterId='${costCenterId}')`,
    sort: 'createdIn DESC',
  })

  return savedCarts
}
