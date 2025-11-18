import { ServiceContext } from '@vtex/api'

import { Clients } from '../clients'
import { getAllPromotions as getAllPromotionsQuery } from '../resolvers/queries/getAllPromotions'

export async function getAllPromotions(context: ServiceContext<Clients>) {
  const promotions = await getAllPromotionsQuery(null, null, context)

  context.body = promotions
}
