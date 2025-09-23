import { ServiceContext } from '@vtex/api'

import { Clients } from '../clients'

export async function getImportSpreadsheetSample(ctx: ServiceContext<Clients>) {
  const sampleProducts = await ctx.clients.search.products({
    query: '',
    category: null,
    specificationFilters: null,
    collection: null,
    orderBy: 'OrderByScoreDESC',
    salesChannel: null,
    from: 0,
    to: 2,
    hideUnavailableItems: true,
    completeSpecifications: false,
    simulationBehavior: 'default',
  })

  const csvContent = sampleProducts.reduce((acc, product, index) => {
    const [item] = product.items

    return `${acc}"${item.nameComplete}",${index + 1}\n`
  }, 'Item,Quantity\n')

  ctx.set('content-type', 'text/csv')
  ctx.body = csvContent
}
