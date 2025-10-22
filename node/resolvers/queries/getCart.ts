import { ServiceContext } from '@vtex/api'
import type { QueryGetCartArgs, SavedCart } from 'ssesandbox04.checkout-b2b'

import { Clients } from '../../clients'
import {
  getSessionData,
  SAVED_CART_ENTITY,
  SAVED_CART_FIELDS,
} from '../../utils'

export const getCart = async (
  _: unknown,
  { id }: QueryGetCartArgs,
  context: ServiceContext<Clients>
) => {
  const cart = await context.clients.masterdata.getDocument<SavedCart>({
    dataEntity: SAVED_CART_ENTITY,
    fields: SAVED_CART_FIELDS,
    id,
  })

  if (!cart) return null

  const { organizationId, costCenterId } = await getSessionData(context)

  if (
    cart.organizationId !== organizationId ||
    cart.costCenterId !== costCenterId
  ) {
    return null
  }

  return { ...cart, status: cart.status ?? 'open' }
}
