import { ServiceContext } from '@vtex/api'

import { Clients } from '../../clients'
import { APP_ID } from '../../utils'
import { getAppSettings } from '../queries/getAppSettings'

export const saveRepresentativeBalanceSettings = async (
  _: unknown,
  { enabled, openingBalance }: { enabled: boolean; openingBalance: number },
  context: ServiceContext<Clients>
) => {
  const settings = await getAppSettings(null, null, context)

  const updatedRepresentativeBalance = {
    ...settings.representativeBalance,
    enabled,
    openingBalance,
  }

  const updatedSettings = {
    ...settings,
    representativeBalance: updatedRepresentativeBalance,
  }

  await context.clients.apps.saveAppSettings(APP_ID, updatedSettings)

  return updatedRepresentativeBalance
}
