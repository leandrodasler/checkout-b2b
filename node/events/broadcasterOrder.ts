import { EventContext } from '@vtex/api'
import { SavedCart } from 'ssesandbox04.checkout-b2b'

import { Clients } from '../clients'
import {
  CHECKOUT_B2B_CART_COMMENT_ENTITY,
  getSavedCartId,
  SAVED_CART_ENTITY,
  SCHEMA_VERSION,
} from '../utils'

export async function broadcasterOrder(context: EventContext<Clients>) {
  if (context.body.currentState !== 'order-created' || !context.body.orderId) {
    return
  }

  const order = await context.clients.orders.getOrder(context.body.orderId)
  const savedCartId = getSavedCartId(order?.customData)

  if (!savedCartId) return

  const cart = await context.clients.masterdata.getDocument<
    Pick<SavedCart, 'status' | 'updateQuantity'>
  >({
    dataEntity: SAVED_CART_ENTITY,
    fields: ['status', 'updateQuantity'],
    id: savedCartId,
  })

  let commentStatus = ''

  if (cart.status !== 'orderPlaced') {
    context.clients.masterdata.updatePartialDocument({
      dataEntity: SAVED_CART_ENTITY,
      id: savedCartId,
      schema: SCHEMA_VERSION,
      fields: {
        status: 'orderPlaced',
        updateQuantity: (cart.updateQuantity ?? 0) + 1,
      },
    })

    commentStatus = `Status: ${cart.status} > orderPlaced. `
  }

  const comment = `${commentStatus}Order ID: ${context.body.orderId}`

  context.clients.masterdata.createDocument({
    dataEntity: CHECKOUT_B2B_CART_COMMENT_ENTITY,
    schema: SCHEMA_VERSION,
    fields: { comment, savedCartId, email: order.clientProfileData.email },
  })
}
