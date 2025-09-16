import { NotFoundError, ServiceContext } from '@vtex/api'

import { Clients } from '../../clients'
import { getSessionData, handleCheckoutApiError } from '../../utils'

export async function addItemsToCart(
  _: unknown,
  {
    orderItems,
  }: { orderItems: Array<{ seller: string; id: number; quantity: number }> },
  context: ServiceContext<Clients>
) {
  const { orderFormId } = await getSessionData(context)

  if (!orderFormId) throw new NotFoundError('order-form-not-found')

  const { checkoutExtension } = context.clients

  checkoutExtension.setOrderFormId(orderFormId)

  return checkoutExtension
    .addItemsToCart(orderItems)
    .catch(handleCheckoutApiError)
}
