import {
  InstanceOptions,
  IOContext,
  JanusClient,
  RequestConfig,
} from '@vtex/api'

import { checkoutCookieFormat, ownershipCookieFormat } from '../utils'

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

  private getCommonHeaders() {
    const { orderFormId, ownerId } = (this
      .context as unknown) as CustomIOContext

    const checkoutCookie = orderFormId ? checkoutCookieFormat(orderFormId) : ''
    const ownershipCookie = ownerId ? ownershipCookieFormat(ownerId) : ''

    return {
      ...this.options?.headers,
      Cookie: `${checkoutCookie}${ownershipCookie}vtex_segment=${this.context.segmentToken};vtex_session=${this.context.sessionToken};`,
    }
  }

  private post<T = void>(url: string, body: unknown, options?: RequestConfig) {
    return this.http.post<T>(url, body, {
      ...options,
      headers: this.getCommonHeaders(),
    })
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
    return this.post(this.routes.shippingData, shippingData, {
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
      {
        metric: 'checkoutExtension-startTransaction',
      }
    )
  }

  public async setPayments(orderGroup: string, payment: PaymentsBody) {
    return this.post(
      this.routes.payments(payment.transaction?.id, orderGroup),
      [payment],
      {
        metric: 'checkoutExtension-setPayments',
      }
    )
  }

  public async gatewayCallback(orderGroup: string) {
    return this.post(this.routes.gatewayCallback(orderGroup), undefined, {
      metric: 'checkoutExtension-gatewayCallback',
    })
  }

  private get routes() {
    const base = `/api/checkout/pub/orderForm/${this.orderFormId}`
    const baseAttachments = `${base}/attachments`

    return {
      invoiceData: `${baseAttachments}/invoiceData`,
      shippingData: `${baseAttachments}/shippingData`,
      marketingData: `${baseAttachments}/marketingData`,
      startTransaction: `${base}/transaction`,
      payments: (transactionId?: string, orderGroup?: string) =>
        `/api/payments/pub/transactions/${transactionId}/payments?orderId=${orderGroup}`,
      gatewayCallback: (orderGroup: string) =>
        `/api/checkout/pub/gatewayCallback/${orderGroup}`,
    }
  }
}
