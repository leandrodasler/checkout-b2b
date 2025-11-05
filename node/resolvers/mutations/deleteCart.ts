import { NotFoundError, ServiceContext } from '@vtex/api'
import type { MutationDeleteCartArgs } from 'ssesandbox04.checkout-b2b'

import { Clients } from '../../clients'
import {
  CHECKOUT_B2B_CART_COMMENT_ENTITY,
  CHECKOUT_B2B_CUSTOM_APP_ID,
  deleteSavedCart,
  getAllSavedCarts,
  getSavedCartId,
  getSessionData,
  SAVED_CART_ENTITY,
  SCHEMA_VERSION,
} from '../../utils'
import { getCart } from '../queries/getCart'
import { getCartComments } from '../queries/getCartComments'

export const deleteCart = async (
  _: unknown,
  { id }: MutationDeleteCartArgs,
  context: ServiceContext<Clients>
) => {
  const { masterdata, checkoutExtension } = context.clients
  const { orderFormId } = await getSessionData(context)

  if (!orderFormId) throw new NotFoundError('order-form-not-found')
  checkoutExtension.setOrderFormId(orderFormId)

  const current = await getCart(null, { id }, context)

  if (!current) return null

  await deleteSavedCart(context, id)

  const currentOrderForm = await checkoutExtension.getOrderForm()
  const currentSavedCartId = getSavedCartId(currentOrderForm.customData)

  if (id === currentSavedCartId) {
    await context.clients.checkoutExtension.removeCustomField(
      CHECKOUT_B2B_CUSTOM_APP_ID,
      'savedCart'
    )
  }

  if (current.childrenQuantity) {
    const childrenCarts = await getAllSavedCarts({
      context,
      where: `(parentCartId='${id}')`,
    })

    await Promise.all(
      childrenCarts.map((child) => deleteSavedCart(context, child.id))
    )
  }

  if (current.parentCartId) {
    const parent = await getCart(null, { id: current.parentCartId }, context)

    if (parent?.childrenQuantity) {
      await masterdata.updatePartialDocument({
        dataEntity: SAVED_CART_ENTITY,
        schema: SCHEMA_VERSION,
        id: parent.id,
        fields: {
          childrenQuantity: parent.childrenQuantity - 1,
        },
      })
    }
  }

  const cartComments = await getCartComments(null, { savedCartId: id }, context)

  await Promise.all(
    cartComments.map((comment) =>
      context.clients.masterdata.deleteDocument({
        dataEntity: CHECKOUT_B2B_CART_COMMENT_ENTITY,
        id: comment.id,
      })
    )
  )

  return id
}
