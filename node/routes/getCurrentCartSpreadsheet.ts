import { ServiceContext } from '@vtex/api'

import { Clients } from '../clients'
import { getSessionData } from '../utils'

export async function getCurrentCartSpreadsheet(ctx: ServiceContext<Clients>) {
  const { orderFormId } = await getSessionData(ctx)

  if (!orderFormId) throw new Error('order-form-not-found')

  const orderForm = await ctx.clients.checkout.orderForm(orderFormId)

  const csvLines = orderForm.items.reduce((acc, item) => {
    return `${acc}"${item.skuName}",${item.quantity}\n`
  }, 'Item,Quantity\n')

  ctx.set('content-type', 'text/csv')
  ctx.body = csvLines
}
