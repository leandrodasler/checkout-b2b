/* eslint-disable no-console */
import { NotFoundError, ResolverError, ServiceContext } from '@vtex/api'
import { Address } from 'vtex.checkout-graphql'

import { Clients } from '../../clients'
import { getSessionData } from '../../utils'

export async function addAddressToCart(
  _: unknown,
  { address }: { address: Address },
  context: ServiceContext<Clients>
) {
  console.log('================')
  console.log('addAddressToCart')
  const { orderFormId } = await getSessionData(context)

  if (!orderFormId) throw new NotFoundError('order-form-not-found')

  const { checkout, checkoutExtension } = context.clients
  const initialOrderForm = (await checkout.orderForm(orderFormId)) as OrderForm
  const { items: originalItems, shippingData } = initialOrderForm
  const {
    logisticsInfo: originalLogisticsInfo,
    selectedAddresses,
  } = shippingData

  // if (selectedAddresses.find((a) => a.addressId === address.addressId)) {
  //   throw new UserInputError('address-already-in-order-form')
  // }

  console.log({ selectedAddresses })

  console.log(
    'originalLogisticsInfo:',
    originalLogisticsInfo.map(({ itemIndex, addressId }) => ({
      itemIndex,
      addressId,
    }))
  )

  checkoutExtension.setOrderFormId(orderFormId)
  const [firstSelectedAddress] = selectedAddresses

  const itemsFromFirstSelectedAddress = originalLogisticsInfo
    .filter((l) => l.addressId === firstSelectedAddress.addressId)
    .map((l) => ({ ...originalItems[l.itemIndex], itemIndex: l.itemIndex }))

  // const itemsFromFirstSelectedAddress = !firstSelectedAddress
  //   ? originalItems
  //   : originalItems.filter((_item, index) =>
  //       originalLogisticsInfo.find(
  //         (l) =>
  //           l.itemIndex === index &&
  //           l.addressId === firstSelectedAddress.addressId
  //       )
  //     )

  console.log(
    'itemsFromFirstSelectedAddress',
    itemsFromFirstSelectedAddress.map(({ refId, skuName }) => ({
      refId,
      skuName,
    }))
  )

  // pegando os itens ligados ao primeiro endereço e duplicando a quantidade
  await checkoutExtension.updateItemsQuantity(
    itemsFromFirstSelectedAddress.map((item) => ({
      index: item.itemIndex,
      quantity: item.quantity * 2,
    }))
  )

  console.log('duplicou as quantidades')

  let updatedOrderForm: OrderForm | null = null

  // dividindo cada item em 2 com a quantidade original (que foi duplicada no passo anterior para poder dividir agora)
  for await (const item of itemsFromFirstSelectedAddress) {
    updatedOrderForm = await checkoutExtension.splitItem(item.uniqueId, [
      item.quantity,
      item.quantity,
    ])
  }

  console.log('dividiu as quantidades')

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

  console.log(
    'newItems:',
    newItems.map(({ refId, itemIndex }) => ({ refId, itemIndex }))
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
  ]

  console.log('vai atualizar shippingData com os parâmetros:', {
    selectedAddresses: [...selectedAddresses, address],
    logisticsInfo: newLogisticsInfo,
  })

  const newOrderForm = await checkoutExtension.updateOrderFormShipping({
    selectedAddresses: [...selectedAddresses, address],
    logisticsInfo: newLogisticsInfo,
  })

  console.log('shippingData atualizado. retornando...')

  return newOrderForm
}
