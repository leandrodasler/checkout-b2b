import readline from 'readline'

import { NotFoundError, ServiceContext } from '@vtex/api'

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

  const orderItems: AddItemsBody = []

  for await (const line of lineReader) {
    const match = line.match(/^"?([^"]+)"?[,;\t](\d+)$/)

    if (!match) continue

    const [, itemName, quantity] = match

    const [product] = await search
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

    const sku = product?.items.find((item) => item.name === itemName)

    if (sku) {
      orderItems.push({
        id: +sku.itemId,
        quantity: +quantity,
        seller: getDefaultSellerOrWithLowestPrice(sku.sellers),
      })
    }
  }

  lineReader.close()

  if (orderItems.length) {
    return checkoutExtension.addItemsToCart(orderItems)
  }

  return checkout.orderForm(orderFormId)
}
