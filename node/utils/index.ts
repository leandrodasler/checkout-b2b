import type { ErrorLike, ServiceContext } from '@vtex/api'
import { ForbiddenError, ResolverError } from '@vtex/api'
import { SearchProduct } from '@vtex/clients'
import { SavedCart } from 'ssesandbox04.checkout-b2b'
import { PaymentData } from 'vtex.checkout-graphql'

import { Clients } from '../clients'
import {
  B2B_USERS_ENTITY,
  B2B_USERS_FIELDS,
  B2B_USERS_SCHEMA,
} from './constants'
import {
  SAVED_CART_ENTITY,
  SAVED_CART_FIELDS,
  SCHEMA_VERSION,
} from './mdSchema'

export * from './constants'
export * from './mdSchema'
export * from './readFile'

function throwForbiddenError(): never {
  throw new ForbiddenError('Not authenticated in storefront')
}

export async function getSessionData(context: ServiceContext<Clients>) {
  const { vtex, clients } = context
  const { sessionToken = '' } = vtex

  const {
    sessionData: { namespaces },
  } = await clients.session.getSession(sessionToken, [
    'storefront-permissions.userId',
    'checkout.orderFormId',
  ])

  const userId: string | undefined =
    namespaces['storefront-permissions']?.userId?.value

  if (!userId) {
    throwForbiddenError()
  }

  const user = await clients.masterdata.getDocument<B2BUser | null>({
    dataEntity: B2B_USERS_ENTITY,
    fields: B2B_USERS_FIELDS,
    id: userId,
  })

  if (!user) {
    throwForbiddenError()
  }

  const orderFormId: string | undefined =
    namespaces.checkout?.orderFormId?.value

  const {
    email,
    name,
    roleId,
    costId: costCenterId,
    orgId: organizationId,
  } = user

  return { orderFormId, email, name, roleId, organizationId, costCenterId }
}

type GetAllSavedCartsArgs = {
  context: ServiceContext<Clients>
  where?: string
  sort?: string
}

export async function getAllSavedCarts({
  context,
  where,
  sort = 'createdIn DESC',
}: GetAllSavedCartsArgs) {
  const { masterdata } = context.clients
  const result: SavedCart[] = []

  async function fetchCarts(page = 1) {
    const savedCarts = await masterdata.searchDocuments<SavedCart>({
      schema: SCHEMA_VERSION,
      dataEntity: SAVED_CART_ENTITY,
      fields: SAVED_CART_FIELDS,
      pagination: {
        page,
        pageSize: 100,
      },
      where,
      sort,
    })

    if (!savedCarts.length) return

    const savedCartsWithoutRoleId = savedCarts.filter((cart) => !cart.roleId)
    const emailRoleIdMap: Record<string, string> = {}

    for await (const cart of savedCartsWithoutRoleId) {
      if (emailRoleIdMap[cart.email]) continue

      const [user] = await masterdata.searchDocuments<B2BUser>({
        dataEntity: B2B_USERS_ENTITY,
        schema: B2B_USERS_SCHEMA,
        fields: B2B_USERS_FIELDS,
        pagination: { page: 1, pageSize: 1 },
        where: `email=${cart.email} AND orgId=${cart.organizationId} AND costId=${cart.costCenterId}`,
      })

      if (!user?.roleId) continue

      await masterdata.updatePartialDocument({
        dataEntity: SAVED_CART_ENTITY,
        fields: { roleId: user.roleId },
        id: cart.id,
      })

      emailRoleIdMap[cart.email] = user.roleId
    }

    result.push(
      ...savedCarts.map((cart) => {
        const status = cart.status ?? 'open'
        const roleId = cart.roleId ?? emailRoleIdMap[cart.email]
        let { requestedDiscount } = cart

        if (!requestedDiscount) {
          const orderForm = JSON.parse(cart.data) as OrderForm

          requestedDiscount = getPercentualDiscount(orderForm)
        }

        return { ...cart, status, requestedDiscount, roleId }
      })
    )

    await fetchCarts(page + 1)
  }

  await fetchCarts()

  return result
}

export async function deleteSavedCart(
  context: ServiceContext<Clients>,
  id: string
) {
  return context.clients.masterdata.deleteDocument({
    dataEntity: SAVED_CART_ENTITY,
    id,
  })
}

export function getFirstInstallmentByPaymentSystem(
  installmentOptions: PaymentData['installmentOptions'],
  paymentSystem?: string | null
) {
  const installmentOption = installmentOptions.find(
    (option) => option.paymentSystem === paymentSystem
  )

  return installmentOption?.installments[0]
}

const CHECKOUT_COOKIE = 'checkout.vtex.com'
const OWNERSHIP_COOKIE = 'CheckoutOrderFormOwnership'

export function checkoutCookieFormat(orderFormId: string) {
  return `${CHECKOUT_COOKIE}=__ofid=${orderFormId};`
}

export function ownershipCookieFormat(ownerId: string) {
  return `${OWNERSHIP_COOKIE}=${ownerId};`
}

export async function getRepresentativeEmail(
  context: ServiceContext<Clients>,
  email?: string
) {
  let inputEmail = email

  if (!inputEmail) {
    const { email: sessionEmail } = await getSessionData(context)

    inputEmail = sessionEmail
  }

  if (!inputEmail) {
    throw new ForbiddenError('not-authorized')
  }

  return inputEmail
}

export function handleCheckoutApiError(e: ErrorLike): never {
  const { code, message } = e.response?.data?.error ?? {}

  if (code && message) {
    throw new ResolverError(`${code}: ${message}`)
  }

  throw e as Error
}

export function getDefaultSellerOrWithLowestPrice<
  T extends SearchProduct['items'][number]['sellers']
>(sellers: T) {
  return (
    sellers.find((s) => s.sellerDefault)?.sellerId ??
    sellers.sort(
      (s1: T[number], s2: T[number]) =>
        s1.commertialOffer.Price - s2.commertialOffer.Price
    )[0].sellerId
  )
}

export function removeAccents(str?: string | null) {
  return (
    str
      ?.normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim() ?? ''
  )
}

export function normalizeString(str?: string | null) {
  return removeAccents(str)?.replace(/\s/g, '') ?? ''
}

export function getManualPriceDiscount({ items, totalizers }: OrderForm) {
  const hasManualPrice = items?.some(
    (item) => item.manualPrice && item.manualPrice !== item.price
  )

  const discountTotalizer = totalizers.find(
    (totalizer) => totalizer.id === 'Discounts'
  )

  return hasManualPrice ? (discountTotalizer?.value ?? 0) / 100 : 0
}

export function getPercentualDiscount(orderForm: OrderForm) {
  const discounts = getManualPriceDiscount(orderForm) * 100
  const totalizerItems = orderForm.totalizers.find((t) => t.id === 'Items')

  return Math.round(((discounts * -1) / (totalizerItems?.value ?? 0)) * 100)
}

export function getMaxDiscountByRoleId(settings: AppSettings, roleId: string) {
  switch (roleId) {
    case 'sales-admin':
      return settings.salesAdmin ?? 0

    case 'sales-manager':
      return settings.salesManager ?? 0

    case 'sales-representative':
      return settings.salesRepresentative ?? 0

    default:
      return Infinity
  }
}

export const B2B_CHECKOUT_CUSTOM_APP_ID = 'b2b-checkout-settings'
export const PO_NUMBER_CUSTOM_FIELD = 'purchaseOrderNumber'
export const CHECKOUT_B2B_CUSTOM_APP_ID = 'checkout-b2b'

const B2B_CHECKOUT_SETTINGS_APP = {
  fields: [PO_NUMBER_CUSTOM_FIELD],
  id: B2B_CHECKOUT_CUSTOM_APP_ID,
  major: 1,
}

const CHECKOUT_B2B_CUSTOM_APP = {
  fields: ['savedCart'],
  id: CHECKOUT_B2B_CUSTOM_APP_ID,
  major: 1,
}

export const ORDER_FORM_CONFIGURATION = {
  allowManualPrice: true,
  allowMultipleDeliveries: true,
  apps: [B2B_CHECKOUT_SETTINGS_APP, CHECKOUT_B2B_CUSTOM_APP],
}

export function isExpectedOrderFormConfiguration(
  config: OrderFormConfiguration
) {
  const orderFormB2BCheckoutSettingsAppConfiguration = config.apps.find(
    (app) => app.id === B2B_CHECKOUT_CUSTOM_APP_ID
  )

  const orderFormCheckoutB2BAppConfiguration = config.apps.find(
    (app) => app.id === CHECKOUT_B2B_CUSTOM_APP_ID
  )

  const hasExpectedB2BCheckoutSettingsCustomFields =
    orderFormB2BCheckoutSettingsAppConfiguration &&
    B2B_CHECKOUT_SETTINGS_APP.fields.every((expectedField) =>
      orderFormB2BCheckoutSettingsAppConfiguration.fields.some(
        (field) => field === expectedField
      )
    )

  const hasExpectedCheckoutB2BCustomFields =
    orderFormCheckoutB2BAppConfiguration &&
    CHECKOUT_B2B_CUSTOM_APP.fields.every((expectedField) =>
      orderFormCheckoutB2BAppConfiguration.fields.some(
        (field) => field === expectedField
      )
    )

  return (
    config.allowManualPrice &&
    config.allowMultipleDeliveries &&
    hasExpectedB2BCheckoutSettingsCustomFields &&
    hasExpectedCheckoutB2BCustomFields
  )
}
