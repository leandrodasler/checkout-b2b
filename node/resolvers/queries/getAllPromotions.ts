import { ServiceContext } from '@vtex/api'

import { Clients } from '../../clients'

export async function getAllPromotions(
  _: unknown,
  __: unknown,
  context: ServiceContext<Clients>
) {
  const { promotions: promotionsClient } = context.clients
  const allPromotionsResponse = await promotionsClient.getAllBenefits()
  const activePromotions = allPromotionsResponse.items.filter(
    (item) => item.isActive && item.status === 'active'
  )

  const promotionsData = await Promise.all(
    activePromotions.map((promotion) =>
      promotionsClient.getPromotionById(promotion.idCalculatorConfiguration)
    )
  )

  return activePromotions.map((promotion) => ({
    ...promotion,
    ...promotionsData.find(
      (i) => i.idCalculatorConfiguration === promotion.idCalculatorConfiguration
    ),
  }))
}
