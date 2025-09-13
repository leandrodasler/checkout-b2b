import {
  InstanceOptions,
  IOContext,
  JanusClient,
  RequestConfig,
} from '@vtex/api'

import { checkoutCookieFormat, ownershipCookieFormat } from '../utils'

const CHECKOUT_API_BASE_PATH = '/api/checkout/pub'

export class CheckoutExtension extends JanusClient {
  private orderFormId?: string

  constructor(ctx: IOContext, options?: InstanceOptions) {
    super(ctx, {
      ...options,
      headers: {
        ...options?.headers,
        ...(ctx.storeUserAuthToken && {
          VtexIdclientAutCookie: ctx.storeUserAuthToken,
        }),
      },
    })
  }

  private getRequestConfig(options?: RequestConfig) {
    const { orderFormId, ownerId } = (this
      .context as unknown) as CustomIOContext

    const checkoutCookie = orderFormId ? checkoutCookieFormat(orderFormId) : ''
    const ownershipCookie = ownerId ? ownershipCookieFormat(ownerId) : ''

    return {
      ...options,
      headers: {
        ...this.options?.headers,
        Cookie: `${checkoutCookie}${ownershipCookie}vtex_segment=${this.context.segmentToken};vtex_session=${this.context.sessionToken};`,
        ...options?.headers,
      },
    }
  }

  private post<T = void>(url: string, body: unknown, options?: RequestConfig) {
    return this.http.post<T>(url, body, this.getRequestConfig(options))
  }

  private put<T = void>(url: string, body: unknown, options?: RequestConfig) {
    return this.http.put<T>(url, body, this.getRequestConfig(options))
  }

  private patch<T = void>(url: string, body: unknown, options?: RequestConfig) {
    return this.http.patch<T>(url, body, this.getRequestConfig(options))
  }

  public setOrderFormId(orderFormId: string) {
    this.orderFormId = orderFormId
  }

  public async updateOrderFormInvoiceData(invoiceData: unknown) {
    return this.post(this.routes.invoiceData, invoiceData, {
      metric: 'checkoutExtension-updateOrderFormInvoiceData',
    })
  }

  public async updateOrderFormShipping(shippingData: unknown) {
    return this.post<OrderForm>(this.routes.shippingData, shippingData, {
      metric: 'checkoutExtension-updateOrderFormShipping',
    })
  }

  public async updateOrderFormMarketingData(marketingData: unknown) {
    return this.post(this.routes.marketingData, marketingData, {
      metric: 'checkoutExtension-updateOrderFormMarketingData',
    })
  }

  public async startTransaction(transactionData: unknown) {
    return this.post<TransactionResponse>(
      this.routes.startTransaction,
      transactionData,
      { metric: 'checkoutExtension-startTransaction' }
    )
  }

  public async setPayments(orderGroup: string, payment: PaymentsBody) {
    return this.post(
      this.routes.payments(payment.transaction?.id, orderGroup),
      [payment],
      { metric: 'checkoutExtension-setPayments' }
    )
  }

  public async gatewayCallback(orderGroup: string) {
    return this.post(this.routes.gatewayCallback(orderGroup), undefined, {
      metric: 'checkoutExtension-gatewayCallback',
    })
  }

  public async updatePrice(itemIndex: number, price: number) {
    return this.put<OrderForm>(
      this.routes.updatePrice(itemIndex),
      { price },
      {
        metric: 'checkoutExtension-updatePrice',
        headers: {
          VtexIdclientAutCookie: this.context.authToken,
        },
      }
    )
  }

  public addItemsToCart(orderItems: AddItemsBody) {
    return this.post<OrderForm>(
      this.routes.items,
      { orderItems },
      { metric: 'checkoutExtension-addItemsToCart' }
    )
  }

  public updateItemsQuantity(orderItems: UpdateItemsQuantityBody) {
    return this.patch<OrderForm>(
      this.routes.items,
      { orderItems },
      { metric: 'checkoutExtension-updateItemQuantity' }
    )
  }

  public splitItem(uniqueId: string, quantities: number[]) {
    return this.post<OrderForm>(
      this.routes.splitItems(uniqueId),
      quantities.map((quantity) => ({ quantity })),
      { metric: 'checkoutExtension-splitItem' }
    )
  }

  private get routes() {
    const orderFormBasePath = `${CHECKOUT_API_BASE_PATH}/orderForm/${this.orderFormId}`
    const attachmentsBasePath = `${orderFormBasePath}/attachments`

    return {
      invoiceData: `${attachmentsBasePath}/invoiceData`,
      shippingData: `${attachmentsBasePath}/shippingData`,
      marketingData: `${attachmentsBasePath}/marketingData`,
      startTransaction: `${orderFormBasePath}/transaction`,
      payments: (transactionId?: string, orderGroup?: string) =>
        `/api/payments/pub/transactions/${transactionId}/payments?orderId=${orderGroup}`,
      gatewayCallback: (orderGroup: string) =>
        `${CHECKOUT_API_BASE_PATH}/gatewayCallback/${orderGroup}`,
      items: `${orderFormBasePath}/items`,
      updatePrice: (itemIndex: number) =>
        `${this.routes.items}/${itemIndex}/price`,
      splitItems: (itemUniqueId: string) =>
        `${this.routes.items}/${itemUniqueId}/split`,
    }
  }
}
