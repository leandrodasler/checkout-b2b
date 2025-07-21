import { NotFoundError, ResolverError, ServiceContext } from '@vtex/api'
import { MutationUpdatePricesArgs } from 'ssesandbox04.checkout-b2b'

import { Clients } from '../../clients'
import { getSessionData } from '../../utils'

export async function updatePrices(
  _: unknown,
  { items }: MutationUpdatePricesArgs,
  context: ServiceContext<Clients>
) {
  const { orderFormId } = await getSessionData(context)

  if (!orderFormId) throw new NotFoundError('order-form-not-found')

  const { checkout, checkoutExtension } = context.clients

  if (!items.length) {
    return checkout.orderForm(orderFormId)
  }

  checkoutExtension.setOrderFormId(orderFormId)
  let updatedOrderForm: OrderForm | null = null

  for await (const item of items) {
    if (!item) continue

    updatedOrderForm = await checkoutExtension.updatePrice(
      item.index,
      item.price
    )
  }

  if (!updatedOrderForm) {
    throw new ResolverError('error-updating-prices')
  }

  return updatedOrderForm
}
