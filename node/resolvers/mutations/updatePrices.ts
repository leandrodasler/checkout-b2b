import { NotFoundError, ResolverError, ServiceContext } from '@vtex/api'
import { MutationUpdatePricesArgs } from 'ssesandbox04.checkout-b2b'

import { Clients } from '../../clients'
import { getSessionData, handleCheckoutApiError } from '../../utils'
import { saveCart } from './saveCart'

export async function updatePrices(
  _: unknown,
  { items, title, additionalData }: MutationUpdatePricesArgs,
  context: ServiceContext<Clients>
) {
  const { orderFormId } = await getSessionData(context)

  if (!orderFormId) throw new NotFoundError('order-form-not-found')

  const { checkout, checkoutExtension } = context.clients

  if (!items.length) {
    return checkout.orderForm(orderFormId)
  }

  checkoutExtension.setOrderFormId(orderFormId)
  let updatedOrderForm: OrderForm | null | void = null

  for await (const item of items) {
    if (!item) continue

    updatedOrderForm = await checkoutExtension
      .updatePrice(item.index, item.price)
      .catch(handleCheckoutApiError)
  }

  if (!updatedOrderForm) {
    throw new ResolverError('error-updating-prices')
  }

  if (title) {
    await saveCart(null, { title, additionalData }, context)
  }

  return updatedOrderForm
}
