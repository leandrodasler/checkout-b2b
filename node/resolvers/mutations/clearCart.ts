import { NotFoundError, ServiceContext } from '@vtex/api'

import { Clients } from '../../clients'
import { CHECKOUT_B2B_CUSTOM_APP_ID, getSessionData } from '../../utils'

export const clearCart = async (
  _: unknown,
  __: unknown,
  context: ServiceContext<Clients>
) => {
  const { orderFormId } = await getSessionData(context)

  if (!orderFormId) throw new NotFoundError('order-form-not-found')

  context.clients.checkoutExtension.setOrderFormId(orderFormId)

  await context.clients.checkoutExtension.removeCustomField(
    CHECKOUT_B2B_CUSTOM_APP_ID,
    'savedCart'
  )

  return context.clients.checkoutExtension.removeAllItems()
}
