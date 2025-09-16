import { NotFoundError, ResolverError, ServiceContext } from '@vtex/api'
import { MutationAddAddressToCartArgs } from 'ssesandbox04.checkout-b2b'

import { Clients } from '../../clients'
import { getSessionData, handleCheckoutApiError } from '../../utils'

export async function addAddressToCart(
  _: unknown,
  { address }: MutationAddAddressToCartArgs,
  context: ServiceContext<Clients>
) {
  const { orderFormId } = await getSessionData(context)

  if (!orderFormId) throw new NotFoundError('order-form-not-found')

  const { checkout, checkoutExtension } = context.clients

  checkoutExtension.setOrderFormId(orderFormId)

  const initialOrderForm = (await checkout.orderForm(orderFormId)) as OrderForm
  const { items: originalItems, shippingData } = initialOrderForm
  const {
    logisticsInfo: originalLogisticsInfo,
    selectedAddresses,
  } = shippingData

  const [firstSelectedAddress] = selectedAddresses

  const itemsFromFirstSelectedAddress = originalLogisticsInfo
    .filter((l) => l.addressId === firstSelectedAddress.addressId)
    .map((l) => ({ ...originalItems[l.itemIndex], itemIndex: l.itemIndex }))

  await checkoutExtension
    .updateItemsQuantity(
      itemsFromFirstSelectedAddress.map((item) => ({
        index: item.itemIndex,
        quantity: item.quantity * 2,
      }))
    )
    .catch(handleCheckoutApiError)

  let updatedOrderForm: OrderForm | null = null

  for await (const item of itemsFromFirstSelectedAddress) {
    try {
      updatedOrderForm = await checkoutExtension.splitItem(item.uniqueId, [
        item.quantity,
        item.quantity,
      ])
    } catch (e) {
      handleCheckoutApiError(e)
    }
  }

  if (!updatedOrderForm) throw new ResolverError('error-splitting-items')

  const updatedItemsWithIndex = updatedOrderForm.items.map((item, index) => ({
    itemIndex: index,
    addressId: updatedOrderForm.shippingData.logisticsInfo.find(
      (l) => l.itemIndex === index
    )?.addressId,
    ...item,
  }))

  const originalItemsWithUpdatedIndexes = updatedItemsWithIndex.filter((item) =>
    originalItems.some((i) => i.uniqueId === item.uniqueId)
  )

  const newItems = updatedItemsWithIndex.filter(
    (item) => !originalItems.some((i) => i.uniqueId === item.uniqueId)
  )

  const newLogisticsInfo = [
    ...originalItemsWithUpdatedIndexes.map(({ itemIndex, addressId }) => ({
      itemIndex,
      addressId,
    })),
    ...newItems.map(({ itemIndex }) => ({
      itemIndex,
      addressId: address.addressId,
    })),
  ].sort((a, b) => a.itemIndex - b.itemIndex)

  const newOrderForm = await checkoutExtension
    .updateOrderFormShipping({
      selectedAddresses: [...selectedAddresses, address],
      logisticsInfo: newLogisticsInfo,
    })
    .catch((e) => {
      checkoutExtension.updateItemsQuantity(
        newItems.map((item) => ({
          index: item.itemIndex,
          quantity: 0,
        }))
      )

      handleCheckoutApiError(e)
    })

  return newOrderForm
}
