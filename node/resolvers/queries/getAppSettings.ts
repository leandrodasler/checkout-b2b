import { ServiceContext } from '@vtex/api'

import { Clients } from '../../clients'
import { APP_ID } from '../../utils'

const DEFAULT_ROLES_ALLOWED_TO_SEE_MARGIN = [
  'store-admin',
  'sales-admin',
  'sales-manager',
  'sales-representative',
]

export const getAppSettings = async (
  _: unknown,
  __: unknown,
  context: ServiceContext<Clients>
) => {
  const settings = await context.clients.apps.getAppSettings(APP_ID)

  const rolesAllowedToSeeMargin = settings.rolesAllowedToSeeMargin
    ? Object.entries(settings.rolesAllowedToSeeMargin)
        .filter(([, isAllowed]) => isAllowed)
        .map(([role]) => role)
    : DEFAULT_ROLES_ALLOWED_TO_SEE_MARGIN

  const representativeBalance = {
    ...settings.representativeBalance,
    enabled: settings.representativeBalance?.enabled ?? false,
    allowNegativeBalance:
      settings.representativeBalance?.allowNegativeBalance ?? false,
  }

  return {
    ...settings,
    rolesAllowedToSeeMargin,
    representativeBalance,
  } as AppSettings
}
