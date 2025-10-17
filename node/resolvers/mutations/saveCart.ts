import { NotFoundError, ServiceContext } from '@vtex/api'
import type { MutationSaveCartArgs, SavedCart } from 'ssesandbox04.checkout-b2b'

import { Clients } from '../../clients'
import {
  CHECKOUT_B2B_CUSTOM_APP_ID,
  getMaxDiscountByRoleId,
  getPercentualDiscount,
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

  const { checkout, masterdata } = context.clients
  const orderForm = (await checkout.orderForm(orderFormId)) as OrderForm

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

  let currentCart: SavedCart | null = null

  if (id) {
    currentCart = await getCart(null, { id }, context)
  }

  const percentualDiscount = getPercentualDiscount(orderForm)
  const settings = await getAppSettings(null, null, context)
  const maxDiscount = getMaxDiscountByRoleId(settings, roleId)
  const calculatedStatus = percentualDiscount > maxDiscount ? 'pending' : 'open'
  const data = JSON.stringify({ ...orderForm, ...additionalDataObject })

  const { DocumentId } = await masterdata.createOrUpdatePartialDocument({
    schema: SCHEMA_VERSION,
    dataEntity: SAVED_CART_ENTITY,
    fields: {
      id,
      title: currentCart?.title ?? newTitle,
      email:
        calculatedStatus === 'pending' ? email : currentCart?.email ?? email,
      orderFormId,
      organizationId: currentCart?.organizationId ?? organizationId,
      costCenterId: currentCart?.costCenterId ?? costCenterId,
      data,
      parentCartId: currentCart?.parentCartId ?? parentCartId,
      requestedDiscount: percentualDiscount,
      status:
        currentCart?.status === 'pending' && calculatedStatus === 'open'
          ? 'pending'
          : calculatedStatus,
      roleId:
        calculatedStatus === 'pending' ? roleId : currentCart?.roleId ?? roleId,
    },
  })

  const savedCartPromises = [
    checkout.setSingleCustomData(orderFormId, {
      appFieldName: 'savedCart',
      appId: CHECKOUT_B2B_CUSTOM_APP_ID,
      value: DocumentId,
    }),
  ]

  if (parentSavedCart?.id) {
    savedCartPromises.push(
      masterdata.updatePartialDocument({
        dataEntity: SAVED_CART_ENTITY,
        id: parentSavedCart.id,
        fields: {
          childrenQuantity: (parentSavedCart.childrenQuantity ?? 0) + 1,
        },
      })
    )
  }

  await Promise.all(savedCartPromises)

  return getCart(null, { id: DocumentId }, context)
}
