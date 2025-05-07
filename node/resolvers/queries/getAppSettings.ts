import { ServiceContext } from '@vtex/api'

import { Clients } from '../../clients'

export const getAppSettings = async (
  _: unknown,
  __: unknown,
  context: ServiceContext<Clients>
) => {
  const settings = await context.clients.apps.getAppSettings(
    process.env.VTEX_APP_ID ?? ''
  )

  const rolesAllowedToSeeMargin = settings.rolesAllowedToSeeMargin
    ? Object.entries(settings.rolesAllowedToSeeMargin)
        .filter(([, isAllowed]) => isAllowed)
        .map(([role]) => role)
    : []

  return {
    ...settings,
    rolesAllowedToSeeMargin,
  }
}
