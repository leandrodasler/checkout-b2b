import { NotFoundError, ServiceContext } from '@vtex/api'
import { MutationUpdateShippingOptionArgs } from 'ssesandbox04.checkout-b2b'

import { Clients } from '../../clients'
import { getSessionData, handleCheckoutApiError } from '../../utils'

export async function updateShippingOption(
  _: unknown,
  { addressId, itemIndexes, selectedSla }: MutationUpdateShippingOptionArgs,
  context: ServiceContext<Clients>
) {
  const { orderFormId } = await getSessionData(context)

  if (!orderFormId) throw new NotFoundError('order-form-not-found')

  const { checkoutExtension } = context.clients

  checkoutExtension.setOrderFormId(orderFormId)
  const initialOrderForm = await checkoutExtension.getOrderForm()
  const { shippingData } = initialOrderForm
  const { logisticsInfo, selectedAddresses } = shippingData

  const newLogisticsInfo = logisticsInfo.map((l) => ({
    itemIndex: l.itemIndex,
    addressId: l.addressId,
    selectedSla:
      addressId && l.addressId === addressId
        ? selectedSla
        : itemIndexes?.includes(l.itemIndex)
        ? selectedSla
        : l.selectedSla,
  }))

  const newOrderForm = await checkoutExtension
    .updateOrderFormShipping({
      selectedAddresses,
      logisticsInfo: newLogisticsInfo,
    })
    .catch(handleCheckoutApiError)

  return newOrderForm
}
