import readline from 'readline'

import { NotFoundError, ServiceContext } from '@vtex/api'

import { Clients } from '../../clients'
import {
  getDefaultSellerOrWithLowestPrice,
  getSessionData,
  itemHasRefId,
  normalizeString,
  searchProducts,
} from '../../utils'

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
  const { checkoutExtension } = ctx.clients

  checkoutExtension.setOrderFormId(orderFormId)

  const readStream = createReadStream()
  const lineReader = readline.createInterface({
    input: readStream,
    crlfDelay: Infinity,
  })

  const orderItems: AddItemsBody = []

  for await (const line of lineReader) {
    const match = line.match(/^"?([^"]+)"?[,;\t]("?([^"]*)"?[,;\t])?(\d+)$/)

    if (!match) continue

    const [, refId, , name, quantity] = match

    const [productByRefId] = await searchProducts(ctx, {
      query: `?fq=alternateIds_RefId:${refId}`,
      to: 1,
    })

    let sku = productByRefId?.items.find((item) => {
      return itemHasRefId(item, refId) || item.ean === refId
    })

    if (!sku && name) {
      const [productByName] = await searchProducts(ctx, { query: name, to: 1 })
      const itemNameNormalized = normalizeString(name)

      sku = productByName?.items.find(
        (item) =>
          itemNameNormalized.includes(normalizeString(item.name)) ||
          itemNameNormalized.includes(normalizeString(item.nameComplete))
      )
    }

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

  return checkoutExtension.getOrderForm()
}
