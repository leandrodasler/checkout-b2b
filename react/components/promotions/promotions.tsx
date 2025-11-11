import React from 'react'
import { useCssHandles } from 'vtex.css-handles'
import { Card } from 'vtex.styleguide'

import { PromotionDescriptionPart } from './promotionDescriptionPart'
import { usePromotions } from './usePromotions'

export function Promotions() {
  const { promotions, loading } = usePromotions()
  const handles = useCssHandles([
    'promotionsContainer',
    'promotionCard',
    'promotionDescriptionContainer',
  ] as const)

  if (!promotions.length || loading) return null

  return (
    <div
      className={`${handles.promotionsContainer} flex mb5 items-stretch justify-center`}
    >
      {promotions.map((promotion) => (
        <div key={promotion.id} className={handles.promotionCard}>
          <Card>
            <h3 className="mt0 mb4">{promotion.title}</h3>
            {!!promotion.descriptionParts?.length && (
              <div
                className={`${handles.promotionDescriptionContainer} flex flex-column`}
              >
                {promotion.descriptionParts.map((description, index) => (
                  <PromotionDescriptionPart
                    key={index}
                    descriptionPart={description}
                  />
                ))}
              </div>
            )}
          </Card>
        </div>
      ))}
    </div>
  )
}
