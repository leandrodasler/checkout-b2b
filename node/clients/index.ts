import type { Cached, ClientsConfig } from '@vtex/api'
import { IOClients, LRUCache } from '@vtex/api'
import { Checkout } from '@vtex/clients'

import { CheckoutExtension } from './CheckoutExtension'

export class Clients extends IOClients {
  public get checkout() {
    return this.getOrSet('checkout', Checkout)
  }

  public get checkoutExtension() {
    return this.getOrSet('checkoutExtension', CheckoutExtension)
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
