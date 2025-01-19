import { ServiceContext } from '@vtex/api'

import { Clients } from '../clients'

export const SAVED_CART_ENTITY = 'checkout_b2b_cart'
export const SAVED_CART_FIELDS = [
  'id',
  'createdIn',
  'lastInteractionIn',
  'title',
  'email',
  'orderFormId',
  'organizationId',
  'costCenterId',
  'data',
  'parentCartId',
  'childrenQuantity',
]
export const SAVED_CART_SCHEMA_VERSION = 'v0.0.1'

export const schemas = [
  {
    name: SAVED_CART_ENTITY,
    version: SAVED_CART_SCHEMA_VERSION,
    body: {
      properties: {
        title: { type: 'string' },
        email: { type: 'string' },
        orderFormId: { type: 'string' },
        organizationId: { type: 'string' },
        costCenterId: { type: 'string' },
        data: { type: 'string' },
        parentCartId: { type: ['string', 'null'] },
        childrenQuantity: { type: ['number', 'null'] },
      },
      'v-indexed': [
        'title',
        'email',
        'orderFormId',
        'organizationId',
        'costCenterId',
        'parentCartId',
        'childrenQuantity',
      ],
      'v-immediate-indexing': true,
      'v-cache': false,
    },
  },
]

let schemaSaved = false

export function isSchemaSaved() {
  return schemaSaved
}

export function setSchemaSaved() {
  schemaSaved = true
}

export async function saveSchemas(context: ServiceContext<Clients>) {
  if (isSchemaSaved()) return

  return Promise.all(
    schemas.map((schema) =>
      context.clients.masterdata.createOrUpdateSchema({
        dataEntity: schema.name,
        schemaBody: schema.body,
        schemaName: schema.version,
      })
    )
  )
    .then(() => setSchemaSaved())
    .catch((e) => {
      if (e.response.status !== 304) {
        throw e
      }

      setSchemaSaved()
    })
}
