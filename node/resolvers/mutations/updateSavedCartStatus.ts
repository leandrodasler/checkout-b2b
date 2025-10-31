import { NotFoundError, ServiceContext } from '@vtex/api'
import { MutationUpdateSavedCartStatusArgs } from 'ssesandbox04.checkout-b2b'

import { Clients } from '../../clients'
import {
  createSavedCartComment,
  getSessionData,
  SAVED_CART_ENTITY,
  SCHEMA_VERSION,
} from '../../utils'
import { getCart } from '../queries/getCart'
import { getSavedCarts } from '../queries/getSavedCarts'

export async function updateSavedCartStatus(
  _: unknown,
  { id, status }: MutationUpdateSavedCartStatusArgs,
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

  if (cart.status !== status) {
    const { email } = await getSessionData(context)
    const comment = `Status: ${cart.status} > ${status}`

    await createSavedCartComment(context, {
      comment,
      savedCartId: cart.id,
      email,
      currentUpdateQuantity: cart.updateQuantity,
    })
  }

  return getSavedCarts(null, { getAll: true }, context)
}
