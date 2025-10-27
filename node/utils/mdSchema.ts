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
  'status',
  'requestedDiscount',
  'roleId',
]

export const REPRESENTATIVE_BALANCE_ENTITY =
  'checkout_b2b_representative_balance'

export const REPRESENTATIVE_BALANCE_FIELDS = [
  'id',
  'createdIn',
  'lastInteractionIn',
  'email',
  'balance',
]

export const REPRESENTATIVE_BALANCE_TRANSACTION_ENTITY =
  'checkout_b2b_representative_balance_transaction'

export const REPRESENTATIVE_BALANCE_TRANSACTION_FIELDS = [
  'id',
  'createdIn',
  'lastInteractionIn',
  'email',
  'oldBalance',
  'newBalance',
  'orderGroup',
]
export const CHECKOUT_B2B_CART_COMMENT_FIELDS = [
  'id',
  'createdIn',
  'savedCartId',
  'email',
  'comment',
]

export const CHECKOUT_B2B_CART_COMMENT_ENTITY = 'checkout_b2b_cart_comment'

export const SCHEMA_VERSION = 'v0.0.1'

export const schemas = [
  {
    name: CHECKOUT_B2B_CART_COMMENT_ENTITY,
    version: SCHEMA_VERSION,
    body: {
      properties: {
        savedCartId: { type: 'string' },
        email: { type: 'string' },
        comment: { type: 'string' },
      },
      'v-indexed': ['savedCartId'],
      'v-immediate-indexing': true,
      'v-cache': false,
    },
  },
  {
    name: SAVED_CART_ENTITY,
    version: SCHEMA_VERSION,
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
        status: { type: ['string', 'null'] },
        requestedDiscount: { type: ['number', 'null'] },
        roleId: { type: ['string', 'null'] },
      },
      'v-indexed': [
        'title',
        'email',
        'orderFormId',
        'organizationId',
        'costCenterId',
        'parentCartId',
        'childrenQuantity',
        'status',
        'roleId',
      ],
      'v-immediate-indexing': true,
      'v-cache': false,
    },
  },
  {
    name: REPRESENTATIVE_BALANCE_ENTITY,
    version: SCHEMA_VERSION,
    body: {
      properties: {
        email: { type: 'string' },
        balance: { type: 'number' },
      },
      'v-indexed': ['email'],
      'v-immediate-indexing': true,
      'v-cache': false,
    },
  },
  {
    name: REPRESENTATIVE_BALANCE_TRANSACTION_ENTITY,
    version: SCHEMA_VERSION,
    body: {
      properties: {
        email: { type: 'string' },
        oldBalance: { type: 'number' },
        newBalance: { type: 'number' },
        orderGroup: { type: 'string' },
      },
      'v-indexed': ['email', 'orderGroup'],
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
