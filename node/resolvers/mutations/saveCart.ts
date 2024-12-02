import { ServiceContext } from '@vtex/api'
import type { MutationSaveCartArgs, SavedCart } from 'ssesandbox04.checkout-b2b'

import { Clients } from '../../clients'
import {
  getSessionData,
  SAVED_CART_ENTITY,
  SAVED_CART_SCHEMA_VERSION,
  saveSchemas,
} from '../../utils'

export const saveCart = async (
  _: unknown,
  { title: inputTitle }: MutationSaveCartArgs,
  context: ServiceContext<Clients>
) => {
  const {
    email,
    orderFormId,
    organizationId,
    costCenterId,
  } = await getSessionData(context)

  await saveSchemas(context)

  const { clients, vtex } = context

  const currentSavedCart = await clients.masterdata.searchDocuments<SavedCart>({
    schema: SAVED_CART_SCHEMA_VERSION,
    dataEntity: SAVED_CART_ENTITY,
    fields: ['id'],
    pagination: {
      page: 1,
      pageSize: 1,
    },
    where: `orderFormId='${orderFormId}'`,
  })

  const id = currentSavedCart[0]?.id
  const title =
    (inputTitle ?? '') || `Cart ${new Date().toLocaleString(vtex.locale)}`

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
    },
  })

  return DocumentId
}
