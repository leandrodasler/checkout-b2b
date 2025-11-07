import { ServiceContext } from '@vtex/api'

import { Clients } from '../clients'
import { getSessionData, normalizeString } from '../utils'

export async function getCurrentCartSpreadsheet(ctx: ServiceContext<Clients>) {
  const { orderFormId } = await getSessionData(ctx)

  if (!orderFormId) throw new Error('order-form-not-found')

  ctx.clients.checkoutExtension.setOrderFormId(orderFormId)
  const orderForm = await ctx.clients.checkoutExtension.getOrderForm()

  const csvContent = orderForm.items.reduce((acc, item) => {
    const { refId, ean, name, skuName } = item

    const outputName = normalizeString(skuName).includes(normalizeString(name))
      ? skuName
      : normalizeString(name).includes(normalizeString(skuName))
      ? name
      : `${name} ${skuName}`

    return `${acc}"${refId || ean}","${outputName}",${item.quantity}\n`
  }, 'Ref,Name,Quantity\n')

  ctx.set('content-type', 'text/csv')
  ctx.body = csvContent
}
