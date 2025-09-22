import { ServiceContext } from '@vtex/api'

import { Clients } from '../clients'

export async function getImportSpreadsheetSample(ctx: ServiceContext<Clients>) {
  const sampleSearchResults = await ctx.clients.search.products({
    query: '',
    category: null,
    specificationFilters: null,
    collection: null,
    orderBy: null,
    salesChannel: null,
    from: 0,
    to: 2,
    hideUnavailableItems: true,
    completeSpecifications: false,
    simulationBehavior: 'default',
  })

  const csvLines = sampleSearchResults.reduce((acc, result, index) => {
    const [item] = result.items

    return `${acc}"${item.name}",${index + 1}\n`
  }, 'Item,Quantity\n')

  ctx.set('content-type', 'text/csv')
  ctx.body = csvLines
}
