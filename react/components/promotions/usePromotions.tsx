import React, { useMemo } from 'react'
import { QueryHookOptions, useQuery } from 'react-apollo'
import { useIntl } from 'react-intl'
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

type ParsePromotionArgs = {
  promotion: Promotion
  orderForm: CompleteOrderForm
  priceFormatter: (value: number) => string
  listFormatter: (value: React.ReactNode[]) => React.ReactNode
}

function parsePromotion({
  promotion,
  orderForm,
  priceFormatter,
  listFormatter,
}: ParsePromotionArgs): PromotionCardData | null {
  const isFreeShipping = promotion.percentualShippingDiscountValue === 100
  const isDiscount =
    promotion.percentualDiscountValue > 0 || promotion.nominalDiscountValue > 0

  if (!isFreeShipping && !isDiscount) return null

  const totalizerItems = orderForm.totalizers.find((t) => t.id === 'Items')
  const totalizerItemsValue = totalizerItems?.value ?? 0
  const totalizerDiscounts = orderForm.totalizers.find((t) => t.id === 'Items')
  const totalizerDiscountsValue = totalizerDiscounts?.value ?? 0

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

  const minValue = promotion.totalValueFloor > 0 && promotion.totalValueFloor
  const maxValue = promotion.totalValueCeling > 0 && promotion.totalValueCeling

  const paymentMethods =
    promotion.paymentsMethods?.map(
      (m: PromotionPaymentMethod | null) => m?.name
    ) ?? []

  const appliesToAllCatalog = promotion.scope.allCatalog
  const appliesToCategories =
    promotion.categories.map((c: PromotionCategory, index: number) => {
      const splittedCategoryName = c.name.split(/\s+\|\s+/)
      const finalCategoryName = splittedCategoryName?.[
        splittedCategoryName?.length - 1
      ]?.replace(/\s*\(\d+\)/, '')

      return (
        <span key={index} className="b ml1">
          {finalCategoryName}
        </span>
      )
    }) ?? []

  const appliesToBrands =
    promotion.brands.map((c: PromotionCategory, index: number) => {
      const finalCategoryName = c.name.replace(/\s*\(\d+\)/, '')

      return (
        <span key={index} className="b ml1">
          {finalCategoryName}
        </span>
      )
    }) ?? []

  const appliesToCollections =
    promotion.collections.map((c: PromotionCategory, index: number) => {
      const finalCategoryName = c.name.replace(/\s*\(\d+\)/, '')

      return (
        <span key={index} className="b ml1">
          {finalCategoryName}
        </span>
      )
    }) ?? []

  const descriptionParts: DescriptionPart[] = []

  if (promotion.name && !promotion.description) {
    descriptionParts.push({ text: promotion.name, type: 'info' })
  }

  if (promotion.description) {
    descriptionParts.push({ text: promotion.description, type: 'info' })
  }

  if (paymentMethods.length) {
    descriptionParts.push({
      text: (
        <>
          Pagando com <span className="b">{listFormatter(paymentMethods)}</span>
        </>
      ),
      type: 'info',
    })
  }

  if (maxValue && !minValue) {
    descriptionParts.push({
      text: (
        <>
          Em compras até <span className="b">{priceFormatter(maxValue)}</span>
        </>
      ),
      type: 'info',
    })
  }

  if (minValue) {
    if (maxValue) {
      descriptionParts.push({
        text: (
          <>
            Em compras entre{' '}
            <span className="b">{priceFormatter(minValue)}</span>
            {' e '}
            <span className="b">{priceFormatter(maxValue)}</span>
          </>
        ),
        type: 'info',
      })
    } else {
      descriptionParts.push({
        text: (
          <>
            Em compras acima de{' '}
            <span className="b">{priceFormatter(minValue)}</span>
          </>
        ),
        type: 'info',
      })
    }

    // eslint-disable-next-line no-console
    console.log({
      title,
      totalCartItems,
      totalizerItemsValue,
      appliesToAllCatalog,
      'orderForm.totalizers': orderForm.totalizers,
    })

    const itemsTotalValue =
      appliesToAllCatalog && !maxValue && !totalizerDiscountsValue
        ? totalCartItems / 100
        : totalizerItemsValue / 100

    if (
      itemsTotalValue < minValue &&
      (!maxValue || itemsTotalValue < maxValue)
    ) {
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

    if (
      itemsTotalValue >= minValue &&
      (!maxValue || itemsTotalValue < maxValue)
    ) {
      descriptionParts.push({ text: 'Objetivo atingido', type: 'success' })
    }
  }

  if (!appliesToAllCatalog && appliesToCategories.length) {
    if (promotion.scope.categoriesAreInclusive) {
      descriptionParts.push({
        text: (
          <>
            Válido apenas{' '}
            {appliesToCategories.length > 1 ? 'as categorias' : 'a categoria'}{' '}
            {listFormatter(appliesToCategories)}.
          </>
        ),
        type: 'warning',
      })
    } else {
      descriptionParts.push({
        text: (
          <>
            Não é válido para{' '}
            {appliesToCategories.length > 1 ? 'as categorias' : 'a categoria'}{' '}
            {listFormatter(appliesToCategories)}.
          </>
        ),
        type: 'warning',
      })
    }
  }

  if (!appliesToAllCatalog && appliesToBrands.length) {
    if (promotion.scope.brandsAreInclusive) {
      descriptionParts.push({
        text: (
          <>
            Válido apenas para{' '}
            {appliesToBrands.length > 1 ? 'as marcas' : 'a marca'}{' '}
            {listFormatter(appliesToBrands)}.
          </>
        ),
        type: 'warning',
      })
    } else {
      descriptionParts.push({
        text: (
          <>
            Não é válido para{' '}
            {appliesToBrands.length > 1 ? 'as marcas' : 'a marca'}{' '}
            {listFormatter(appliesToBrands)}.
          </>
        ),
        type: 'warning',
      })
    }
  }

  if (!appliesToAllCatalog && appliesToCollections.length) {
    if (promotion.scope.collectionsAreInclusive) {
      descriptionParts.push({
        text: (
          <>
            Válido apenas para{' '}
            {appliesToCollections.length > 1 ? 'as coleções' : 'a coleção'}{' '}
            {listFormatter(appliesToCollections)}.
          </>
        ),
        type: 'warning',
      })
    } else {
      descriptionParts.push({
        text: (
          <>
            Não é válido para{' '}
            {appliesToCollections.length > 1 ? 'as coleções' : 'a coleção'}{' '}
            {listFormatter(appliesToCollections)}.
          </>
        ),
        type: 'warning',
      })
    }
  }

  if (
    promotion.accumulateWithManualPrice !== null &&
    !promotion.accumulateWithManualPrice
  ) {
    descriptionParts.push({
      text: (
        <>Não é válido quando o carrinho possui desconto de uma negociação.</>
      ),
      type: 'warning',
    })
  }

  return {
    id: promotion.idCalculatorConfiguration,
    title,
    descriptionParts,
  }
}

export function usePromotions(
  options?: QueryHookOptions<QueryGetAllPromotions>
) {
  const { data, loading } = useQuery<QueryGetAllPromotions>(
    QUERY_GET_ALL_PROMOTIONS,
    options
  )

  const { orderForm, loading: orderFormLoading } = useOrderFormCustom()
  const priceFormatter = useFormatPrice()
  const { formatList: listFormatter } = useIntl()

  const promotionItems = data?.getAllPromotions

  const promotions: PromotionCardData[] = useMemo(() => {
    if (!promotionItems) return []

    return promotionItems
      .map((p: Promotion) =>
        parsePromotion({
          promotion: p,
          orderForm,
          priceFormatter,
          listFormatter,
        })
      )
      .filter((p: PromotionCardData | null): p is PromotionCardData =>
        Boolean(p)
      )
  }, [listFormatter, orderForm, priceFormatter, promotionItems])

  return { promotions, loading: loading || orderFormLoading }
}
