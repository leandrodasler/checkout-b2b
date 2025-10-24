import { NotFoundError, ResolverError, ServiceContext } from '@vtex/api'
import {
  MutationSaveCartArgs,
  MutationUpdatePricesArgs,
} from 'ssesandbox04.checkout-b2b'

import { Clients } from '../../clients'
import {
  getSavedCartId,
  getSessionData,
  handleCheckoutApiError,
} from '../../utils'
import { getCart } from '../queries/getCart'
import { saveCart as saveCartMutation } from './saveCart'

export async function updatePrices(
  _: unknown,
  { items, title, additionalData }: MutationUpdatePricesArgs,
  context: ServiceContext<Clients>
) {
  const { orderFormId, email } = await getSessionData(context)

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

  async function saveCart(args: MutationSaveCartArgs) {
    return saveCartMutation(null, args, context)
  }

  if (title) {
    const commonSaveCartArgs = { title, additionalData }
    const currentOrderForm = await checkoutExtension.getOrderForm()
    const savedCartId = getSavedCartId(currentOrderForm.customData)
    const currentSavedCart = savedCartId
      ? await getCart(null, { id: savedCartId }, context)
      : null

    if (currentSavedCart?.email && currentSavedCart.email !== email) {
      await saveCart({ parentCartId: savedCartId, ...commonSaveCartArgs })
    } else {
      await saveCart({ id: savedCartId, ...commonSaveCartArgs })
    }

    return checkoutExtension.getOrderForm()
  }

  return updatedOrderForm
}
