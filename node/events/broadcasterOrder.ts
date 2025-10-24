import { EventContext } from '@vtex/api'

import { Clients } from '../clients'
import { getSavedCartId, SAVED_CART_ENTITY } from '../utils'

export async function broadcasterOrder(context: EventContext<Clients>) {
  if (context.body.currentState !== 'order-created' || !context.body.orderId) {
    return
  }

  const order = await context.clients.orders.getOrder(context.body.orderId)
  const savedCartId = getSavedCartId(order?.customData)

  if (!savedCartId) return

  context.clients.masterdata.updatePartialDocument({
    dataEntity: SAVED_CART_ENTITY,
    id: savedCartId,
    fields: { status: 'orderPlaced' },
  })
}
