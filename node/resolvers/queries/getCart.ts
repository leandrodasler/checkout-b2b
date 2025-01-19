import { ServiceContext } from '@vtex/api'
import type { QueryGetCartArgs, SavedCart } from 'ssesandbox04.checkout-b2b'

import { Clients } from '../../clients'
import { SAVED_CART_ENTITY, SAVED_CART_FIELDS, saveSchemas } from '../../utils'

export const getCart = async (
  _: unknown,
  { id }: QueryGetCartArgs,
  context: ServiceContext<Clients>
) => {
  await saveSchemas(context)

  return context.clients.masterdata.getDocument<SavedCart>({
    dataEntity: SAVED_CART_ENTITY,
    fields: SAVED_CART_FIELDS,
    id,
  })
}
