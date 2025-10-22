import { NotFoundError, ServiceContext } from '@vtex/api'
import { MutationUpdateSavedCartTitleArgs } from 'ssesandbox04.checkout-b2b'

import { Clients } from '../../clients'
import { SAVED_CART_ENTITY } from '../../utils'
import { getCart } from '../queries/getCart'

export async function updateSavedCartTitle(
  _: unknown,
  { id, title }: MutationUpdateSavedCartTitleArgs,
  context: ServiceContext<Clients>
) {
  const cart = await getCart(null, { id }, context)

  if (!cart) throw new NotFoundError('cart-not-found')

  await context.clients.masterdata.updatePartialDocument({
    dataEntity: SAVED_CART_ENTITY,
    id,
    fields: { title },
  })

  return { ...cart, title }
}
