import { NotFoundError, ServiceContext } from '@vtex/api'
import type { MutationSaveCartArgs, SavedCart } from 'ssesandbox04.checkout-b2b'

import { Clients } from '../../clients'
import {
  CHECKOUT_B2B_CUSTOM_APP_ID,
  getManualPriceDiscount,
  getMaxDiscountByRoleId,
  getSessionData,
  SAVED_CART_ENTITY,
  SCHEMA_VERSION,
} from '../../utils'
import { getAppSettings } from '../queries/getAppSettings'
import { getCart } from '../queries/getCart'

export const saveCart = async (
  _: unknown,
  { id, title, additionalData, parentCartId }: MutationSaveCartArgs,
  context: ServiceContext<Clients>
) => {
  const {
    email,
    orderFormId,
    organizationId,
    costCenterId,
    roleId,
  } = await getSessionData(context)

  if (!orderFormId) throw new NotFoundError('order-form-not-found')

  const { clients } = context
  const orderForm = (await clients.checkout.orderForm(orderFormId)) as OrderForm

  let additionalDataObject = {}

  try {
    additionalDataObject = JSON.parse(additionalData ?? '{}')
  } catch {
    /**/
  }

  let parentSavedCart: SavedCart | null = null
  let newTitle = title

  if (parentCartId) {
    parentSavedCart = await getCart(null, { id: parentCartId }, context)

    if (parentSavedCart) {
      newTitle = `${parentSavedCart.title} (${
        (parentSavedCart.childrenQuantity ?? 0) + 2
      })`
    }
  }

  const discounts = getManualPriceDiscount(orderForm) * 100
  const totalizerItems = orderForm.totalizers.find((t) => t.id === 'Items')
  const percentualDiscount = Math.round(
    ((discounts * -1) / (totalizerItems?.value ?? 0)) * 100
  )

  const settings = await getAppSettings(null, null, context)
  const maxDiscount = getMaxDiscountByRoleId(settings, roleId)
  const status = percentualDiscount > maxDiscount ? 'pending' : 'open'
  const data = JSON.stringify({ ...orderForm, ...additionalDataObject })

  const { DocumentId } = await clients.masterdata.createOrUpdateEntireDocument({
    schema: SCHEMA_VERSION,
    dataEntity: SAVED_CART_ENTITY,
    fields: {
      id,
      title: newTitle,
      email,
      orderFormId,
      organizationId,
      costCenterId,
      data,
      parentCartId,
      requestedDiscount: percentualDiscount,
      status,
      roleId,
    },
  })

  const savedCartPromises = [
    clients.checkout.setSingleCustomData(orderFormId, {
      appFieldName: 'savedCart',
      appId: CHECKOUT_B2B_CUSTOM_APP_ID,
      value: DocumentId,
    }),
  ]

  if (parentSavedCart?.id) {
    savedCartPromises.push(
      clients.masterdata.updatePartialDocument({
        dataEntity: SAVED_CART_ENTITY,
        id: parentSavedCart.id,
        schema: SCHEMA_VERSION,
        fields: {
          childrenQuantity: (parentSavedCart.childrenQuantity ?? 0) + 1,
        },
      })
    )
  }

  await Promise.all(savedCartPromises)

  return getCart(null, { id: DocumentId }, context)
}
