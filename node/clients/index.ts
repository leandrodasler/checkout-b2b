import type { Cached, ClientsConfig } from '@vtex/api'
import { IOClients, LRUCache } from '@vtex/api'
import { Checkout, Search, RatesAndBenefits } from '@vtex/clients'

import { CheckoutExtension } from './CheckoutExtension'
import Mail from './Mail'
import Orders from './Orders'

export class Clients extends IOClients {
  public get checkout() {
    return this.getOrSet('checkout', Checkout)
  }

  public get search() {
    return this.getOrSet('search', Search)
  }

  public get checkoutExtension() {
    return this.getOrSet('checkoutExtension', CheckoutExtension)
  }

  public get mail() {
    return this.getOrSet('mail', Mail)
  }

  public get orders() {
    return this.getOrSet('orders', Orders)
  }

  public get promotions() {
    return this.getOrSet('promotions', RatesAndBenefits)
  }
}

const memoryCache = new LRUCache<string, Cached>({ max: 5000 })

export default {
  implementation: Clients,
  options: {
    default: {
      asyncSetCache: true,
      exponentialTimeoutCoefficient: 2,
      exponentialBackoffCoefficient: 2,
      initialBackoffDelay: 100,
      retries: 3,
      timeout: 3000,
      concurrency: 10,
      memoryCache,
    },
  },
} as ClientsConfig<Clients>
