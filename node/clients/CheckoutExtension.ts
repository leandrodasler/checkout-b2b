import { InstanceOptions, IOContext, JanusClient } from '@vtex/api'

type TransactionResponse = {
  id: string
  orderGroup: string
  merchantTransactions?: Array<{ merchantName: string }>
  messages: Array<{ text?: string; status?: string }>
}

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

  public setOrderFormId(orderFormId: string) {
    this.orderFormId = orderFormId
  }

  public async updateOrderFormInvoiceData(invoiceData: unknown) {
    return this.http.post(this.routes.invoiceData, invoiceData, {
      metric: 'checkoutExtension-updateOrderFormInvoiceData',
    })
  }

  public async startTransaction(transactionData: unknown) {
    return this.http.post<TransactionResponse>(
      this.routes.startTransaction,
      transactionData,
      {
        metric: 'checkoutExtension-startTransaction',
      }
    )
  }

  public async setPayments(orderGroup: string, payment: PaymentsBody) {
    return this.http.post(
      this.routes.payments(payment.transaction?.id, orderGroup),
      [payment],
      {
        metric: 'checkoutExtension-setPayments',
      }
    )
  }

  public async gatewayCallback(orderGroup: string) {
    return this.http.post(this.routes.gatewayCallback(orderGroup), undefined, {
      metric: 'checkoutExtension-gatewayCallback',
    })
  }

  private get routes() {
    const base = `/api/checkout/pub/orderForm/${this.orderFormId}`

    return {
      invoiceData: `${base}/attachments/invoiceData`,
      startTransaction: `${base}/transaction`,
      payments: (transactionId?: string, orderGroup?: string) =>
        `/api/payments/pub/transactions/${transactionId}/payments?orderId=${orderGroup}`,
      gatewayCallback: (orderGroup: string) =>
        `/api/checkout/pub/gatewayCallback/${orderGroup}`,
    }
  }
}
