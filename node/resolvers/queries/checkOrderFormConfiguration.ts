import { ServiceContext } from '@vtex/api'

import { Clients } from '../../clients'
import {
  isExpectedOrderFormConfiguration,
  ORDER_FORM_CONFIGURATION,
} from '../../utils'

export const checkOrderFormConfiguration = async (
  _: unknown,
  __: unknown,
  context: ServiceContext<Clients>
) => {
  const { checkoutExtension } = context.clients
  const currentOrderFormConfiguration = await checkoutExtension.getOrderFormConfiguration()

  if (isExpectedOrderFormConfiguration(currentOrderFormConfiguration)) {
    return { state: 'ready', data: currentOrderFormConfiguration }
  }

  const filteredCurrentApps = currentOrderFormConfiguration.apps.filter(
    (app) => !ORDER_FORM_CONFIGURATION.apps.some(({ id }) => id === app.id)
  )

  const updatedOrderFormConfiguration = {
    ...currentOrderFormConfiguration,
    ...ORDER_FORM_CONFIGURATION,
    apps: [...filteredCurrentApps, ...ORDER_FORM_CONFIGURATION.apps],
  }

  await checkoutExtension.updateOrderFormConfiguration(
    updatedOrderFormConfiguration
  )

  return { state: 'updated', data: updatedOrderFormConfiguration }
}
