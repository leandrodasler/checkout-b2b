import { NotFoundError, ServiceContext } from '@vtex/api'
import type { MutationSaveCartArgs } from 'ssesandbox04.checkout-b2b'

import { Clients } from '../../clients'
import {
  CHECKOUT_B2B_CUSTOM_APP_ID,
  createSavedCartComment,
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

  const { checkout, checkoutExtension, masterdata } = context.clients

  checkoutExtension.setOrderFormId(orderFormId)
  const orderForm = await checkoutExtension.getOrderForm()

  let additionalDataObject = {}

  try {
    additionalDataObject = JSON.parse(additionalData ?? '{}')
  } catch {
    /**/
  }

  let newTitle = title
  const parentSavedCart = parentCartId
    ? await getCart(null, { id: parentCartId }, context)
    : null

  if (parentSavedCart) {
    newTitle = `${parentSavedCart.title} (${
      (parentSavedCart.childrenQuantity ?? 0) + 2
    })`
  }

  const currentCart = id ? await getCart(null, { id }, context) : null
  const percentualDiscount = getPercentualDiscount(orderForm)
  const settings = await getAppSettings(null, null, context)
  const maxDiscount = getMaxDiscountByRoleId(settings, roleId)
  const status = percentualDiscount > maxDiscount ? 'pending' : 'open'
  const data = JSON.stringify({ ...orderForm, ...additionalDataObject })

  const { DocumentId } = await masterdata.createOrUpdatePartialDocument({
    schema: SCHEMA_VERSION,
    dataEntity: SAVED_CART_ENTITY,
    fields: {
      id,
      title: currentCart?.title ?? newTitle,
      email,
      orderFormId,
      organizationId: currentCart?.organizationId ?? organizationId,
      costCenterId: currentCart?.costCenterId ?? costCenterId,
      data,
      parentCartId: currentCart?.parentCartId ?? parentCartId,
      requestedDiscount: percentualDiscount,
      status,
      roleId,
    },
  })

  const comments: string[] = []

  if (currentCart) {
    if (currentCart.status !== status) {
      comments.push(`Status: ${currentCart.status} > ${status}.`)
    }

    if (currentCart.requestedDiscount !== percentualDiscount) {
      comments.push(
        `Discount: ${
          currentCart.requestedDiscount && `${currentCart.requestedDiscount} > `
        }${percentualDiscount}.`
      )
    }
  } else {
    comments.push(`Status: ${status}.`)

    if (percentualDiscount) {
      comments.push(`Discount: ${percentualDiscount}.`)
    }
  }

  if (comments.length) {
    await createSavedCartComment(context, {
      comment: comments.join('\n\n'),
      savedCartId: DocumentId,
      email,
      currentUpdateQuantity: currentCart?.updateQuantity ?? 0,
    })
  }

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
