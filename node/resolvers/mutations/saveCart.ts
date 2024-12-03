import { ServiceContext } from '@vtex/api'
import type { MutationSaveCartArgs } from 'ssesandbox04.checkout-b2b'

import { Clients } from '../../clients'
import {
  getSessionData,
  SAVED_CART_ENTITY,
  SAVED_CART_SCHEMA_VERSION,
  saveSchemas,
} from '../../utils'

export const saveCart = async (
  _: unknown,
  { id, title, additionalData }: MutationSaveCartArgs,
  context: ServiceContext<Clients>
) => {
  const {
    email,
    orderFormId,
    organizationId,
    costCenterId,
  } = await getSessionData(context)

  await saveSchemas(context)

  const { clients } = context

  const orderForm = await clients.checkout.orderForm(orderFormId)
  let additionalDataObject = {}

  try {
    additionalDataObject = JSON.parse(additionalData ?? '{}')
  } catch {
    /**/
  }

  const data = JSON.stringify({ ...orderForm, ...additionalDataObject })

  const { DocumentId } = await clients.masterdata.createOrUpdateEntireDocument({
    ...(id && { id }),
    schema: SAVED_CART_SCHEMA_VERSION,
    dataEntity: SAVED_CART_ENTITY,
    fields: {
      title,
      email,
      orderFormId,
      organizationId,
      costCenterId,
      data,
    },
  })

  return DocumentId
}
