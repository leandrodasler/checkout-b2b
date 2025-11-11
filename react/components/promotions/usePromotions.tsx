import React, { useMemo } from 'react'
import { useQuery } from 'react-apollo'
import {
  Promotion,
  PromotionCategory,
  PromotionPaymentMethod,
  Query,
} from 'ssesandbox04.checkout-b2b'

import QUERY_GET_ALL_PROMOTIONS from '../../graphql/getAllPromotions.graphql'
import { useFormatPrice, useOrderFormCustom } from '../../hooks'
import { CompleteOrderForm } from '../../typings'
import { isItemUnavailable } from '../../utils'

type QueryGetAllPromotions = Pick<Query, 'getAllPromotions'>

export type DescriptionPart = { text: React.ReactNode } & (
  | { type: 'info' | 'warning' | 'success' }
  | { type: 'target'; percent: number }
)

type PromotionCardData = {
  id: string
  title: string
  descriptionParts: DescriptionPart[]
}

function parsePromotion(
  promotion: Promotion,
  priceFormatter: (value: number) => string,
  orderForm: CompleteOrderForm
): PromotionCardData | null {
  const isFreeShipping = promotion.percentualShippingDiscountValue === 100
  const isDiscount =
    promotion.percentualDiscountValue > 0 || promotion.nominalDiscountValue > 0

  if (!isFreeShipping && !isDiscount) return null

  const totalizerItems = orderForm.totalizers.find((t) => t.id === 'Items')
  const totalizerItemsValue = totalizerItems?.value ?? 0

  const totalCartItems = orderForm.items
    .filter((item) => !isItemUnavailable(item))
    .reduce((acc, item) => acc + (item.sellingPrice ?? 0) * item.quantity, 0)

  const discountValue =
    promotion.percentualDiscountValue || promotion.nominalDiscountValue

  const discountType = promotion.percentualDiscountValue
    ? 'percentual'
    : promotion.nominalDiscountValue
    ? 'nominal'
    : undefined

  const type = isFreeShipping ? 'free-shipping' : 'discount'

  const title =
    type === 'free-shipping'
      ? 'Frete grátis'
      : discountType === 'percentual'
      ? `${discountValue}% de desconto`
      : `${priceFormatter(discountValue)} de desconto`

  const minValue =
    promotion.totalValueFloor > 0 ? promotion.totalValueFloor : undefined

  const paymentMethods =
    promotion.paymentsMethods?.map(
      (m: PromotionPaymentMethod | null) => m?.name
    ) ?? []

  const appliesToAllCatalog = promotion.scope?.allCatalog
  const appliesToCategories =
    promotion.categories?.map((c: PromotionCategory | null) => {
      const splittedCategoryName = c?.name?.split(/\s+\|\s+/)

      return splittedCategoryName?.[splittedCategoryName?.length - 1]
    }) ?? []

  const descriptionParts: DescriptionPart[] = []

  if (paymentMethods.length) {
    descriptionParts.push({
      text: (
        <>
          Pagando com <span className="b">{paymentMethods.join(', ')}</span>
        </>
      ),
      type: 'info',
    })
  }

  if (minValue) {
    descriptionParts.push({
      text: (
        <>
          Em compras acima de{' '}
          <span className="b">{priceFormatter(minValue)}</span>
        </>
      ),
      type: 'info',
    })

    const itemsTotalValue = appliesToAllCatalog
      ? totalCartItems / 100
      : totalizerItemsValue / 100

    if (/* itemsTotalValue &&  */ itemsTotalValue < minValue) {
      const diff = minValue - itemsTotalValue
      const percentValue = (diff / minValue) * 100
      const percent = Number.isFinite(percentValue)
        ? Math.floor(100 - percentValue)
        : 0

      descriptionParts.push({
        text: (
          <>
            Adicione <span className="b">{priceFormatter(diff)}</span> ao
            carrinho para aproveitar a promoção
          </>
        ),
        type: 'target',
        percent,
      })
    }

    if (/* itemsTotalValue &&  */ itemsTotalValue >= minValue) {
      descriptionParts.push({ text: 'Objetivo atingido', type: 'success' })
    }
  }

  if (!appliesToAllCatalog && appliesToCategories.length) {
    if (promotion.scope?.categoriesAreInclusive) {
      descriptionParts.push({
        text: `Válido apenas para ${appliesToCategories.join(', ')}.`,
        type: 'warning',
      })
    } else {
      descriptionParts.push({
        text: `Não é válido para ${appliesToCategories.join(', ')}.`,
        type: 'warning',
      })
    }
  }

  if (
    promotion.accumulateWithManualPrice !== null &&
    !promotion.accumulateWithManualPrice
  ) {
    descriptionParts.push({
      text: `Não é válido quando o carrinho possui desconto de uma negociação.`,
      type: 'warning',
    })
  }

  return {
    id: promotion.idCalculatorConfiguration,
    title,
    descriptionParts,
  }
}

export function usePromotions() {
  const { data, loading } = useQuery<QueryGetAllPromotions>(
    QUERY_GET_ALL_PROMOTIONS
  )

  const { orderForm, loading: orderFormLoading } = useOrderFormCustom()
  const formatPrice = useFormatPrice()
  const promotionItems = data?.getAllPromotions

  const promotions: PromotionCardData[] = useMemo(() => {
    if (!promotionItems) return []

    return promotionItems
      .map((p: Promotion) => parsePromotion(p, formatPrice, orderForm))
      .filter((p: PromotionCardData | null): p is PromotionCardData =>
        Boolean(p)
      )
  }, [formatPrice, orderForm, promotionItems])

  return { promotions, loading: loading || orderFormLoading }
}
