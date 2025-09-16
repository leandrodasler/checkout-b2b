import { NotFoundError, ServiceContext } from '@vtex/api'

import { Clients } from '../../clients'
import { getSessionData, handleCheckoutApiError } from '../../utils'

export async function updateItemsQuantity(
  _: unknown,
  { orderItems }: { orderItems: Array<{ index: number; quantity: number }> },
  context: ServiceContext<Clients>
) {
  const { orderFormId } = await getSessionData(context)

  if (!orderFormId) throw new NotFoundError('order-form-not-found')

  const { checkoutExtension } = context.clients

  checkoutExtension.setOrderFormId(orderFormId)

  return checkoutExtension
    .updateItemsQuantity(orderItems)
    .catch(handleCheckoutApiError)
}
