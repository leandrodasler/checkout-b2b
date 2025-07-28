import { ServiceContext } from '@vtex/api'

import { Clients } from '../../clients'
import { APP_ID } from '../../utils'

export const saveRepresentativeBalanceSettings = async (
  _: unknown,
  { enabled, openingBalance }: { enabled: boolean; openingBalance?: number },
  context: ServiceContext<Clients>
) => {
  const settings = await context.clients.apps.getAppSettings(APP_ID)
  const updatedRepresentativeBalance = {
    ...settings.representativeBalance,
    enabled,
    openingBalance:
      openingBalance ?? settings.representativeBalance?.openingBalance,
  }

  const updatedSettings = {
    ...settings,
    representativeBalance: updatedRepresentativeBalance,
  }

  await context.clients.apps.saveAppSettings(APP_ID, updatedSettings)

  return updatedRepresentativeBalance
}
