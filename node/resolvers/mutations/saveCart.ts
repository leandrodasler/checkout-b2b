import { ServiceContext } from '@vtex/api'
import type { MutationSaveCartArgs, SavedCart } from 'ssesandbox04.checkout-b2b'

import { Clients } from '../../clients'
import {
  getSessionData,
  SAVED_CART_ENTITY,
  SAVED_CART_FIELDS,
  saveSchemas,
  SCHEMA_VERSION,
} from '../../utils'

export const saveCart = async (
  _: unknown,
  { id, title, additionalData, parentCartId }: MutationSaveCartArgs,
  context: ServiceContext<Clients>
) => {
  await saveSchemas(context)
  const {
    email,
    orderFormId,
    organizationId,
    costCenterId,
  } = await getSessionData(context)

  const { clients } = context

  const orderForm = await clients.checkout.orderForm(orderFormId)
  let additionalDataObject = {}

  try {
    additionalDataObject = JSON.parse(additionalData ?? '{}')
  } catch {
    /**/
  }

  const data = JSON.stringify({ ...orderForm, ...additionalDataObject })

  let parentSavedCart: SavedCart | null = null
  let newTitle = title

  if (parentCartId) {
    parentSavedCart = await clients.masterdata.getDocument<SavedCart>({
      dataEntity: SAVED_CART_ENTITY,
      id: parentCartId,
      fields: SAVED_CART_FIELDS,
    })

    newTitle = `${parentSavedCart.title} (${
      (parentSavedCart.childrenQuantity ?? 0) + 2
    })`
  }

  const { DocumentId } = await clients.masterdata.createOrUpdateEntireDocument({
    ...(id && { id }),
    schema: SCHEMA_VERSION,
    dataEntity: SAVED_CART_ENTITY,
    fields: {
      title: newTitle,
      email,
      orderFormId,
      organizationId,
      costCenterId,
      data,
      parentCartId,
    },
  })

  const savedCart = await clients.masterdata.getDocument<SavedCart>({
    dataEntity: SAVED_CART_ENTITY,
    id: DocumentId,
    fields: SAVED_CART_FIELDS,
  })

  if (parentSavedCart?.id) {
    await clients.masterdata.updatePartialDocument({
      dataEntity: SAVED_CART_ENTITY,
      id: parentSavedCart.id,
      schema: SCHEMA_VERSION,
      fields: { childrenQuantity: (parentSavedCart.childrenQuantity ?? 0) + 1 },
    })
  }

  return savedCart
}
