import type { InstanceOptions, IOContext } from '@vtex/api'
import { ExternalClient } from '@vtex/api'

type GetPriceArgs = {
  skuId: string
  priceTableId: string
}

type ComputedPrice = {
  costPrice: number
  sellingPrice: number
}

export default class Pricing extends ExternalClient {
  constructor(ctx: IOContext, options?: InstanceOptions) {
    super(`http://api.vtex.com/${ctx.account}/pricing/prices`, ctx, {
      ...options,
      headers: {
        ...options?.headers,
        VtexIdclientAutCookie: ctx.authToken,
      },
    })
  }

  public async getPriceByPriceTable({ skuId, priceTableId }: GetPriceArgs) {
    const computedPrice = await this.http.get<ComputedPrice>(
      `/${skuId}/computed/${priceTableId}`,
      { metric: 'pricing-getPriceByPriceTable' }
    )

    return { skuId, ...computedPrice }
  }
}
