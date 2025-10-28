import { NotFoundError, ServiceContext } from '@vtex/api'
import { MutationUpdateSavedCartTitleArgs } from 'ssesandbox04.checkout-b2b'

import { Clients } from '../../clients'
import {
  CHECKOUT_B2B_CART_COMMENT_ENTITY,
  getSessionData,
  SAVED_CART_ENTITY,
  SCHEMA_VERSION,
} from '../../utils'
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

  if (cart.title !== title) {
    const { email } = await getSessionData(context)
    const comment = `"${cart.title}" > "${title}".`

    context.clients.masterdata.createDocument({
      dataEntity: CHECKOUT_B2B_CART_COMMENT_ENTITY,
      schema: SCHEMA_VERSION,
      fields: { comment, savedCartId: cart.id, email },
    })
  }

  return { ...cart, title }
}
