import type { ServiceContext } from '@vtex/api'
import { ForbiddenError } from '@vtex/api'
import { SavedCart } from 'ssesandbox04.checkout-b2b'
import { PaymentData } from 'vtex.checkout-graphql'

import { Clients } from '../clients'
import { B2B_USERS_ENTITY, B2B_USERS_FIELDS } from './constants'
import {
  SAVED_CART_ENTITY,
  SAVED_CART_FIELDS,
  SCHEMA_VERSION,
} from './mdSchema'

export * from './constants'
export * from './mdSchema'

function throwForbiddenError(): never {
  throw new ForbiddenError('Not authenticated in storefront')
}

export async function getSessionData(context: ServiceContext<Clients>) {
  const { vtex, clients } = context
  const { sessionToken = '' } = vtex

  const {
    sessionData: { namespaces },
  } = await clients.session.getSession(sessionToken, [
    'storefront-permissions.userId',
    'checkout.orderFormId',
  ])

  const userId: string | undefined =
    namespaces['storefront-permissions']?.userId?.value

  if (!userId) {
    throwForbiddenError()
  }

  const user = await clients.masterdata.getDocument<B2BUser | null>({
    dataEntity: B2B_USERS_ENTITY,
    fields: B2B_USERS_FIELDS,
    id: userId,
  })

  if (!user) {
    throwForbiddenError()
  }

  const orderFormId: string | undefined =
    namespaces.checkout?.orderFormId?.value

  const {
    email,
    name,
    roleId,
    costId: costCenterId,
    orgId: organizationId,
  } = user

  return { orderFormId, email, name, roleId, organizationId, costCenterId }
}

type GetAllSavedCartsArgs = {
  context: ServiceContext<Clients>
  where: string
  sort?: string
}

export async function getAllSavedCarts({
  context,
  where,
  sort = 'createdIn DESC',
}: GetAllSavedCartsArgs) {
  const { masterdata } = context.clients
  const result: SavedCart[] = []

  async function fetchCarts(page = 1) {
    const savedCarts = await masterdata.searchDocuments<SavedCart>({
      schema: SCHEMA_VERSION,
      dataEntity: SAVED_CART_ENTITY,
      fields: SAVED_CART_FIELDS,
      pagination: {
        page,
        pageSize: 100,
      },
      where,
      sort,
    })

    if (savedCarts.length) {
      result.push(...savedCarts)

      await fetchCarts(page + 1)
    }
  }

  await fetchCarts()

  return result
}

export async function deleteSavedCart(
  context: ServiceContext<Clients>,
  id: string
) {
  return context.clients.masterdata.deleteDocument({
    dataEntity: SAVED_CART_ENTITY,
    id,
  })
}

export function getFirstInstallmentByPaymentSystem(
  installmentOptions: PaymentData['installmentOptions'],
  paymentSystem?: string | null
) {
  const installmentOption = installmentOptions.find(
    (option) => option.paymentSystem === paymentSystem
  )

  return installmentOption?.installments[0]
}

const CHECKOUT_COOKIE = 'checkout.vtex.com'
const OWNERSHIP_COOKIE = 'CheckoutOrderFormOwnership'

export function checkoutCookieFormat(orderFormId: string) {
  return `${CHECKOUT_COOKIE}=__ofid=${orderFormId};`
}

export function ownershipCookieFormat(ownerId: string) {
  return `${OWNERSHIP_COOKIE}=${ownerId};`
}

export async function getRepresentativeEmail(
  context: ServiceContext<Clients>,
  email?: string
) {
  let inputEmail = email

  if (!inputEmail) {
    const { email: sessionEmail } = await getSessionData(context)

    inputEmail = sessionEmail
  }

  if (!inputEmail) {
    throw new ForbiddenError('not-authorized')
  }

  return inputEmail
}
