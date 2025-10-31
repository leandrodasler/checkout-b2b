import { ServiceContext } from '@vtex/api'
import type { MutationDeleteCartArgs } from 'ssesandbox04.checkout-b2b'

import { Clients } from '../../clients'
import {
  deleteSavedCart,
  getAllSavedCarts,
  SAVED_CART_ENTITY,
  SCHEMA_VERSION,
} from '../../utils'
import { getCart } from '../queries/getCart'

export const deleteCart = async (
  _: unknown,
  { id }: MutationDeleteCartArgs,
  context: ServiceContext<Clients>
) => {
  const { masterdata } = context.clients
  const current = await getCart(null, { id }, context)

  if (!current) return null

  await deleteSavedCart(context, id)

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

  return id
}
