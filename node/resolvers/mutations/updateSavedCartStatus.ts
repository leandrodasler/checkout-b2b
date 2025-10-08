import { NotFoundError, ServiceContext } from '@vtex/api'

import { Clients } from '../../clients'
import { SAVED_CART_ENTITY, SCHEMA_VERSION } from '../../utils'
import { getCart } from '../queries/getCart'

export async function updateSavedCartStatus(
  _: unknown,
  { id, status }: { id: string; status: string },
  context: ServiceContext<Clients>
) {
  const cart = await getCart(null, { id }, context)

  if (!cart) throw new NotFoundError('cart-not-found')

  await context.clients.masterdata.updatePartialDocument({
    dataEntity: SAVED_CART_ENTITY,
    schema: SCHEMA_VERSION,
    id,
    fields: { status },
  })

  return { ...cart, status }
}
