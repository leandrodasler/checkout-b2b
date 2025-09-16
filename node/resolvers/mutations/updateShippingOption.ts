import { NotFoundError, ServiceContext } from '@vtex/api'
import { MutationUpdateShippingOptionArgs } from 'ssesandbox04.checkout-b2b'

import { Clients } from '../../clients'
import { getSessionData, handleCheckoutApiError } from '../../utils'

export async function updateShippingOption(
  _: unknown,
  { addressId, selectedSla }: MutationUpdateShippingOptionArgs,
  context: ServiceContext<Clients>
) {
  const { orderFormId } = await getSessionData(context)

  if (!orderFormId) throw new NotFoundError('order-form-not-found')

  const { checkout, checkoutExtension } = context.clients

  checkoutExtension.setOrderFormId(orderFormId)
  const initialOrderForm = (await checkout.orderForm(orderFormId)) as OrderForm
  const { shippingData } = initialOrderForm
  const { logisticsInfo, selectedAddresses } = shippingData

  const newLogisticsInfo = logisticsInfo.map((l) => ({
    itemIndex: l.itemIndex,
    addressId: l.addressId,
    selectedSla: l.addressId === addressId ? selectedSla : l.selectedSla,
  }))

  const newOrderForm = await checkoutExtension
    .updateOrderFormShipping({
      selectedAddresses,
      logisticsInfo: newLogisticsInfo,
    })
    .catch(handleCheckoutApiError)

  return newOrderForm
}
