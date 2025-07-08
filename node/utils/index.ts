import type { ServiceContext } from '@vtex/api'
import { ForbiddenError } from '@vtex/api'
import { SavedCart } from 'ssesandbox04.checkout-b2b'
import { PaymentData } from 'vtex.checkout-graphql'

import { Clients } from '../clients'
import {
  SAVED_CART_ENTITY,
  SAVED_CART_FIELDS,
  SAVED_CART_SCHEMA_VERSION,
} from './mdSchema'

export * from './mdSchema'

export async function getSessionData(context: ServiceContext<Clients>) {
  const { vtex, clients } = context
  const { sessionToken = '' } = vtex

  const {
    sessionData: { namespaces },
  } = await clients.session.getSession(sessionToken, [
    'profile.email',
    'checkout.orderFormId',
    'storefront-permissions.organization',
    'storefront-permissions.costcenter',
  ])

  const email: string | undefined = namespaces.profile?.email?.value

  if (!email) {
    throw new ForbiddenError('Not authenticated in storefront')
  }

  const orderFormId: string | undefined =
    namespaces.checkout?.orderFormId?.value

  const organizationId: string | undefined =
    namespaces['storefront-permissions']?.organization?.value

  const costCenterId: string | undefined =
    namespaces['storefront-permissions']?.costcenter?.value

  return { email, orderFormId, organizationId, costCenterId }
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
      schema: SAVED_CART_SCHEMA_VERSION,
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
