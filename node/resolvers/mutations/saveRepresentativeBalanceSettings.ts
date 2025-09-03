import { ServiceContext } from '@vtex/api'
import type { MutationSaveRepresentativeBalanceSettingsArgs } from 'ssesandbox04.checkout-b2b'

import { Clients } from '../../clients'
import { APP_ID } from '../../utils'

export const saveRepresentativeBalanceSettings = async (
  _: unknown,
  {
    enabled,
    openingBalance,
    allowNegativeBalance,
  }: MutationSaveRepresentativeBalanceSettingsArgs,
  context: ServiceContext<Clients>
) => {
  const settings = await context.clients.apps.getAppSettings(APP_ID)
  const updatedRepresentativeBalance = {
    ...settings.representativeBalance,
    enabled,
    openingBalance:
      openingBalance ?? settings.representativeBalance?.openingBalance,
    allowNegativeBalance,
  }

  const updatedSettings = {
    ...settings,
    representativeBalance: updatedRepresentativeBalance,
  }

  await context.clients.apps.saveAppSettings(APP_ID, updatedSettings)

  return updatedRepresentativeBalance
}
