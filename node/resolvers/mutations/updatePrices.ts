import { NotFoundError, ResolverError, ServiceContext } from '@vtex/api'
import { MutationUpdatePricesArgs } from 'ssesandbox04.checkout-b2b'

import { Clients } from '../../clients'
import {
  CHECKOUT_B2B_CUSTOM_APP_ID,
  getSessionData,
  handleCheckoutApiError,
} from '../../utils'
import { saveCart } from './saveCart'

export async function updatePrices(
  _: unknown,
  { items, title, additionalData }: MutationUpdatePricesArgs,
  context: ServiceContext<Clients>
) {
  const { orderFormId } = await getSessionData(context)

  if (!orderFormId) throw new NotFoundError('order-form-not-found')

  const { checkoutExtension } = context.clients

  checkoutExtension.setOrderFormId(orderFormId)

  if (!items.length) {
    return checkoutExtension.getOrderForm()
  }

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
    const customApp = updatedOrderForm.customData?.customApps.find(
      (app) => app.id === CHECKOUT_B2B_CUSTOM_APP_ID
    )

    const savedCartId = customApp?.fields?.savedCart

    await saveCart(null, { id: savedCartId, title, additionalData }, context)

    return checkoutExtension.getOrderForm()
  }

  return updatedOrderForm
}
