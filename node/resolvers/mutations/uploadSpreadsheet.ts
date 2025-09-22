import readline from 'readline'

import { NotFoundError, ServiceContext } from '@vtex/api'
import { SearchProduct } from '@vtex/clients'

import { Clients } from '../../clients'
import { getDefaultSellerOrWithLowestPrice, getSessionData } from '../../utils'

type FileUpload = Promise<{
  filename: string
  mimetype: string
  encoding: string
  createReadStream: () => NodeJS.ReadableStream
}>

export const uploadSpreadsheet = async (
  _: unknown,
  { file }: { file: FileUpload },
  ctx: ServiceContext<Clients>
) => {
  const { orderFormId } = await getSessionData(ctx)

  if (!orderFormId) throw new NotFoundError('order-form-not-found')

  const { createReadStream } = await file
  const { search, checkoutExtension, checkout } = ctx.clients

  checkoutExtension.setOrderFormId(orderFormId)

  const readStream = createReadStream()
  const lineReader = readline.createInterface({
    input: readStream,
    crlfDelay: Infinity,
  })

  const orderItems: Array<{
    item: SearchProduct['items'][number]
    quantity: number
  }> = []

  for await (const line of lineReader) {
    const match = line.match(/^"?([^"]+)"?[,;\t](\d+)$/)

    if (!match) continue

    const [, itemName, quantity] = match

    const [searchResult] = await search
      .products({
        query: itemName,
        category: null,
        specificationFilters: null,
        collection: null,
        orderBy: null,
        salesChannel: null,
        from: 0,
        to: 1,
        hideUnavailableItems: false,
        completeSpecifications: false,
        simulationBehavior: 'default',
      })
      .catch(() => [undefined])

    const foundSku = searchResult?.items.find((item) => item.name === itemName)

    if (foundSku) {
      orderItems.push({
        item: foundSku,
        quantity: +quantity,
      })
    }
  }

  lineReader.close()

  if (orderItems.length) {
    return checkoutExtension.addItemsToCart(
      orderItems.map(({ item, quantity }) => ({
        id: +item.itemId,
        quantity,
        seller: getDefaultSellerOrWithLowestPrice(item.sellers),
      }))
    )
  }

  return checkout.orderForm(orderFormId)
}
