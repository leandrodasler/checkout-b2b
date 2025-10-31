import { NotFoundError, ServiceContext } from '@vtex/api'
import { MutationCreateCartCommentArgs } from 'ssesandbox04.checkout-b2b'

import { Clients } from '../../clients'
import { createSavedCartComment, getSessionData } from '../../utils'
import { getCart } from '../queries/getCart'

export async function createCartComment(
  _: unknown,
  { savedCartId, comment }: MutationCreateCartCommentArgs,
  context: ServiceContext<Clients>
) {
  const { email } = await getSessionData(context)
  const cart = await getCart(null, { id: savedCartId }, context)

  if (!cart) {
    throw new NotFoundError('cart-not-found')
  }

  return createSavedCartComment(context, {
    comment,
    savedCartId,
    email,
    currentUpdateQuantity: cart.updateQuantity,
  })
}
