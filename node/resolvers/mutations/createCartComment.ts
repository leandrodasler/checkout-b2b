import { NotFoundError, ServiceContext } from '@vtex/api'
import { MutationCreateCartCommentArgs } from 'ssesandbox04.checkout-b2b'

import { Clients } from '../../clients'
import {
  CHECKOUT_B2B_CART_COMMENT_ENTITY,
  CHECKOUT_B2B_CART_COMMENT_FIELDS,
  createSavedCartComment,
  getSessionData,
} from '../../utils'
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

  const [createCommentResponse] = await createSavedCartComment(context, {
    comment,
    savedCartId,
    email,
    currentUpdateQuantity: cart.updateQuantity,
  })

  const { DocumentId } = createCommentResponse

  return context.clients.masterdata.getDocument({
    dataEntity: CHECKOUT_B2B_CART_COMMENT_ENTITY,
    id: DocumentId,
    fields: CHECKOUT_B2B_CART_COMMENT_FIELDS,
  })
}
