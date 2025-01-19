import { ServiceContext } from '@vtex/api'
import type { MutationSaveCartArgs, SavedCart } from 'ssesandbox04.checkout-b2b'

import { Clients } from '../../clients'
import {
  deleteSavedCart,
  getAllSavedCarts,
  SAVED_CART_ENTITY,
  SAVED_CART_FIELDS,
  SAVED_CART_SCHEMA_VERSION,
  saveSchemas,
} from '../../utils'

export const deleteCart = async (
  _: unknown,
  { id }: MutationSaveCartArgs,
  context: ServiceContext<Clients>
) => {
  await saveSchemas(context)
  const { masterdata } = context.clients

  if (id) {
    const current = await masterdata.getDocument<SavedCart>({
      dataEntity: SAVED_CART_ENTITY,
      fields: SAVED_CART_FIELDS,
      id,
    })

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
      const parent = await masterdata.getDocument<SavedCart>({
        dataEntity: SAVED_CART_ENTITY,
        fields: SAVED_CART_FIELDS,
        id: current.parentCartId,
      })

      if (parent.childrenQuantity) {
        await masterdata.updatePartialDocument({
          dataEntity: SAVED_CART_ENTITY,
          schema: SAVED_CART_SCHEMA_VERSION,
          id: parent.id,
          fields: {
            childrenQuantity: parent.childrenQuantity - 1,
          },
        })
      }
    }

    return id
  }

  return null
}
