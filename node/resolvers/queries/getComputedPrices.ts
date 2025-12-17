import { ServiceContext } from '@vtex/api'
import { QueryGetComputedPricesArgs } from 'ssesandbox04.checkout-b2b'

import { Clients } from '../../clients'
import { getSessionData } from '../../utils'

export async function getComputedPrices(
  _: unknown,
  { skuIds }: QueryGetComputedPricesArgs,
  context: ServiceContext<Clients>
) {
  const { priceTables } = await getSessionData(context)
  const [priceTableId = '1'] = priceTables
  const { pricing } = context.clients

  return Promise.all(
    skuIds.map((skuId) => pricing.getPriceByPriceTable({ priceTableId, skuId }))
  )
}
