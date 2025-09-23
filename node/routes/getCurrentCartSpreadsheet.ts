import { ServiceContext } from '@vtex/api'

import { Clients } from '../clients'
import { getSessionData, normalizeString } from '../utils'

export async function getCurrentCartSpreadsheet(ctx: ServiceContext<Clients>) {
  const { orderFormId } = await getSessionData(ctx)

  if (!orderFormId) throw new Error('order-form-not-found')

  const orderForm = await ctx.clients.checkout.orderForm(orderFormId)

  const csvContent = orderForm.items.reduce((acc, item) => {
    const { name, skuName } = item

    const outputName = normalizeString(skuName).includes(normalizeString(name))
      ? skuName
      : normalizeString(name).includes(normalizeString(skuName))
      ? name
      : `${name} ${skuName}`

    return `${acc}"${outputName}",${item.quantity}\n`
  }, 'Item,Quantity\n')

  ctx.set('content-type', 'text/csv')
  ctx.body = csvContent
}
