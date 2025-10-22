import type { InstanceOptions, IOContext } from '@vtex/api'
import { ExternalClient } from '@vtex/api'

const FOUR_SECONDS = 4 * 1000

export default class Orders extends ExternalClient {
  constructor(ctx: IOContext, options?: InstanceOptions) {
    super(`http://${ctx.account}.vtexcommercestable.com.br`, ctx, {
      ...options,
      timeout: FOUR_SECONDS,
    })
  }

  public getOrder = (orderId: string) =>
    this.http.get<Order>(`/api/oms/pvt/admin/orders/${orderId}`, {
      headers: {
        VtexIdclientAutCookie: this.context.authToken,
      },
      metric: 'orders-getOrder',
    })
}
