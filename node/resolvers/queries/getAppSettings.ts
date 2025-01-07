import { ServiceContext } from '@vtex/api'

import { Clients } from '../../clients'

export const getAppSettings = async (
  _: unknown,
  __: unknown,
  context: ServiceContext<Clients>
) => {
  return context.clients.apps.getAppSettings(process.env.VTEX_APP_ID ?? '')
}
