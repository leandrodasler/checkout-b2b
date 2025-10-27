import { ServiceContext } from '@vtex/api'
import { MutationCreateCartCommentArgs } from 'ssesandbox04.checkout-b2b'

import { Clients } from '../../clients'
import {
  CHECKOUT_B2B_CART_COMMENT_ENTITY,
  CHECKOUT_B2B_CART_COMMENT_FIELDS,
  getSessionData,
  SCHEMA_VERSION,
} from '../../utils'

export async function createCartComment(
  _: unknown,
  { savedCartId, comment }: MutationCreateCartCommentArgs,
  context: ServiceContext<Clients>
) {
  const { email } = await getSessionData(context)

  const { DocumentId } = await context.clients.masterdata.createDocument({
    dataEntity: CHECKOUT_B2B_CART_COMMENT_ENTITY,
    schema: SCHEMA_VERSION,
    fields: { comment, savedCartId, email },
  })

  return context.clients.masterdata.getDocument({
    dataEntity: CHECKOUT_B2B_CART_COMMENT_ENTITY,
    id: DocumentId,
    fields: CHECKOUT_B2B_CART_COMMENT_FIELDS,
  })
}
