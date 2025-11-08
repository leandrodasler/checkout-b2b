import { NotFoundError, ServiceContext } from '@vtex/api'
import { MutationUpdateMultipleShippingOptionsArgs } from 'ssesandbox04.checkout-b2b'

import { Clients } from '../../clients'
import { getSessionData, handleCheckoutApiError } from '../../utils'

export async function updateMultipleShippingOptions(
  _: unknown,
  { input }: MutationUpdateMultipleShippingOptionsArgs,
  context: ServiceContext<Clients>
) {
  const { orderFormId } = await getSessionData(context)

  if (!orderFormId) throw new NotFoundError('order-form-not-found')

  const { checkoutExtension } = context.clients

  checkoutExtension.setOrderFormId(orderFormId)
  const initialOrderForm = await checkoutExtension.getOrderForm()
  const { shippingData } = initialOrderForm
  const { logisticsInfo, selectedAddresses } = shippingData

  const newLogisticsInfo = logisticsInfo.map((l) => {
    const inputMatch = input.find(
      (itemInput) => itemInput.itemIndex === l.itemIndex
    )

    const newSla = l.slas.find((sla) => sla.id === inputMatch?.selectedSla)

    return {
      itemIndex: l.itemIndex,
      addressId: l.addressId,
      selectedDeliveryChannel:
        inputMatch?.itemIndex === l.itemIndex && newSla
          ? newSla.deliveryChannel
          : l.selectedDeliveryChannel,
      selectedSla:
        inputMatch?.itemIndex === l.itemIndex
          ? inputMatch.selectedSla ?? l.selectedSla
          : l.selectedSla,
    }
  })

  const newOrderForm = await checkoutExtension
    .updateOrderFormShipping({
      selectedAddresses,
      logisticsInfo: newLogisticsInfo,
    })
    .catch(handleCheckoutApiError)

  return newOrderForm
}
