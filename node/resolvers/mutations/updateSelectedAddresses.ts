import { NotFoundError, ServiceContext } from '@vtex/api'
import { MutationUpdateSelectedAddressesArgs } from 'ssesandbox04.checkout-b2b'

import { Clients } from '../../clients'
import { getSessionData, handleCheckoutApiError } from '../../utils'

export async function updateSelectedAddresses(
  _: unknown,
  { selectedAddresses }: MutationUpdateSelectedAddressesArgs,
  context: ServiceContext<Clients>
) {
  const { orderFormId } = await getSessionData(context)

  if (!orderFormId) throw new NotFoundError('order-form-not-found')

  const { checkoutExtension } = context.clients

  checkoutExtension.setOrderFormId(orderFormId)
  const initialOrderForm = await checkoutExtension.getOrderForm()
  const { shippingData } = initialOrderForm
  const { logisticsInfo } = shippingData
  const newLogisticsInfo = logisticsInfo.map((l) => ({
    ...l,
    addressId: selectedAddresses[0]?.addressId ?? l.addressId,
  }))

  await checkoutExtension
    .updateOrderFormShipping({
      selectedAddresses,
      logisticsInfo: newLogisticsInfo,
    })
    .catch(handleCheckoutApiError)

  return checkoutExtension.getOrderForm()
}
