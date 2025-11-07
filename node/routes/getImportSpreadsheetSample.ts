import { ServiceContext } from '@vtex/api'

import { Clients } from '../clients'
import { searchProducts } from '../utils'

export async function getImportSpreadsheetSample(ctx: ServiceContext<Clients>) {
  const sampleProducts = await searchProducts(ctx, {
    to: 2,
    hideUnavailableItems: true,
  })

  const csvContent = sampleProducts.reduce((acc, product, index: number) => {
    const [item] = product.items
    const refObject = item.referenceId.find((ref) => ref.Key === 'RefId')
    const refId = refObject?.Value ?? ''

    return `${acc}"${refId || item.ean}","${item.nameComplete}",${index + 1}\n`
  }, 'Ref,Name,Quantity\n')

  ctx.set('content-type', 'text/csv')
  ctx.body = csvContent
}
