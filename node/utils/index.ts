import type { ServiceContext } from '@vtex/api'
import { ForbiddenError } from '@vtex/api'

import { Clients } from '../clients'

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
