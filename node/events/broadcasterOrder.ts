import { EventContext } from '@vtex/api'

import { Clients } from '../clients'
import { CHECKOUT_B2B_CUSTOM_APP_ID, SAVED_CART_ENTITY } from '../utils'

export async function broadcasterOrder(context: EventContext<Clients>) {
  if (context.body.currentState !== 'order-created' || !context.body.orderId) {
    return
  }

  const order = await context.clients.orders.getOrder(context.body.orderId)

  const checkoutB2BCustomApp = order?.customData?.customApps?.find(
    (app) => app.id === CHECKOUT_B2B_CUSTOM_APP_ID
  )

  const savedCartId = checkoutB2BCustomApp?.fields?.savedCart

  if (!savedCartId) return

  context.clients.masterdata.updatePartialDocument({
    dataEntity: SAVED_CART_ENTITY,
    id: savedCartId,
    fields: { status: 'orderPlaced' },
  })
}
