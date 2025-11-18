import React, { Fragment, useMemo } from 'react'
import { QueryHookOptions, useQuery } from 'react-apollo'
import { IntlShape, useIntl } from 'react-intl'
import {
  Promotion,
  PromotionCategory,
  PromotionPaymentMethod,
  Query,
} from 'ssesandbox04.checkout-b2b'

import QUERY_GET_ALL_PROMOTIONS from '../../graphql/getAllPromotions.graphql'
import { useFormatPrice, useOrderFormCustom } from '../../hooks'
import { CompleteOrderForm, CustomItem } from '../../typings'
import { hasSomeManualPrice, isItemUnavailable, messages } from '../../utils'

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
  intl: IntlShape
}

function parsePromotion({
  promotion,
  orderForm,
  priceFormatter,
  intl,
}: ParsePromotionArgs): PromotionCardData | null {
  const { formatMessage, formatList } = intl
  const isFreeShipping = promotion.percentualShippingDiscountValue === 100
  const isDiscount =
    promotion.percentualDiscountValue > 0 || promotion.nominalDiscountValue > 0

  if (!isFreeShipping && !isDiscount) return null

  const totalizerItems = orderForm.totalizers.find((t) => t.id === 'Items')
  const totalizerItemsValue = totalizerItems?.value ?? 0
  const totalizerDiscounts = orderForm.totalizers.find(
    (t) => t.id === 'Discounts'
  )

  const totalizerDiscountsValue = totalizerDiscounts?.value ?? 0

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
      ? formatMessage(messages.promotionsFreeDelivery)
      : discountType === 'percentual'
      ? formatMessage(messages.promotionsPercentualDiscount, {
          value: discountValue,
        })
      : formatMessage(messages.promotionsNominalDiscount, {
          value: priceFormatter(discountValue),
        })

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
      text: formatMessage(messages.promotionsPaymentMethod, {
        paymentMethods: (
          <span
            key={`promotion-${promotion.idCalculatorConfiguration}-payment-method`}
            className="b"
          >
            {formatList(paymentMethods)}
          </span>
        ),
      }),
      type: 'info',
    })
  }

  if (maxValue && !minValue) {
    descriptionParts.push({
      text: formatMessage(messages.promotionsMaxValue, {
        value: (
          <span
            key={`promotion-${promotion.idCalculatorConfiguration}-max-value`}
            className="b"
          >
            {priceFormatter(maxValue)}
          </span>
        ),
      }),
      type: 'info',
    })
  }

  if (minValue) {
    if (maxValue) {
      descriptionParts.push({
        text: formatMessage(messages.promotionsMinMaxValue, {
          minValue: (
            <span
              key={`promotion-${promotion.idCalculatorConfiguration}-min-max-min-value`}
              className="b"
            >
              {priceFormatter(minValue)}
            </span>
          ),
          maxValue: (
            <span
              key={`promotion-${promotion.idCalculatorConfiguration}-min-max-max-value`}
              className="b"
            >
              {priceFormatter(maxValue)}
            </span>
          ),
        }),
        type: 'info',
      })
    } else {
      descriptionParts.push({
        text: formatMessage(messages.promotionsMinValue, {
          value: (
            <span
              key={`promotion-${promotion.idCalculatorConfiguration}-min-value`}
              className="b"
            >
              {priceFormatter(minValue)}
            </span>
          ),
        }),
        type: 'info',
      })
    }

    const hasManualPrice = hasSomeManualPrice(orderForm.items)

    const itemsFilter = (item: CustomItem) => {
      if (isItemUnavailable(item)) return false

      const {
        categories,
        brands,
        scope: { categoriesAreInclusive, brandsAreInclusive },
      } = promotion

      const shouldCheckCategories =
        !appliesToAllCatalog && categories.length > 0

      const categoryIntersects = shouldCheckCategories
        ? Object.keys(item.productCategories).some((itemCategory) =>
            categories.some(
              (promotionCategory: PromotionCategory) =>
                promotionCategory.id === String(itemCategory)
            )
          )
        : true

      const categoryPass = shouldCheckCategories
        ? categoriesAreInclusive
          ? categoryIntersects
          : !categoryIntersects
        : true

      const shouldCheckBrands = !appliesToAllCatalog && brands.length > 0
      const itemBrandId = item.additionalInfo?.brandId

      const brandIntersects = shouldCheckBrands
        ? brands.some(
            (promotionBrand: PromotionCategory) =>
              promotionBrand.id === String(itemBrandId)
          )
        : true

      const brandPass = shouldCheckBrands
        ? brandsAreInclusive
          ? brandIntersects
          : !brandIntersects
        : true

      return categoryPass && brandPass
    }

    const totalCartItems = orderForm.items
      .filter(itemsFilter)
      .reduce((acc, item) => acc + (item.sellingPrice ?? 0) * item.quantity, 0)

    const itemsTotalValue =
      (appliesToAllCatalog && !maxValue && !totalizerDiscountsValue) ||
      (!appliesToAllCatalog &&
        !maxValue &&
        !totalizerDiscountsValue &&
        (!!promotion.categories.length || !!promotion.brands.length)) ||
      (isFreeShipping && hasManualPrice)
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
        text: formatMessage(messages.promotionsDiff, {
          value: (
            <span
              key={`promotion-${promotion.idCalculatorConfiguration}-diff`}
              className="b"
            >
              {priceFormatter(diff)}
            </span>
          ),
        }),
        type: 'target',
        percent,
      })
    }

    if (
      itemsTotalValue >= minValue &&
      (!maxValue || itemsTotalValue < maxValue)
    ) {
      descriptionParts.push({
        text: formatMessage(messages.promotionsReachedGoal),
        type: 'success',
      })
    }
  }

  if (!appliesToAllCatalog && appliesToCategories.length) {
    if (promotion.scope.categoriesAreInclusive) {
      descriptionParts.push({
        text: formatMessage(messages.promotionsCategoriesOnly, {
          count: appliesToCategories.length,
          categories: (
            <Fragment
              key={`promotion-${promotion.idCalculatorConfiguration}-categories-only`}
            >
              {formatList(appliesToCategories)}
            </Fragment>
          ),
        }),
        type: 'warning',
      })
    } else {
      descriptionParts.push({
        text: formatMessage(messages.promotionsCategoriesExclude, {
          count: appliesToCategories.length,
          categories: (
            <Fragment
              key={`promotion-${promotion.idCalculatorConfiguration}-categories-exclude`}
            >
              {formatList(appliesToCategories)}
            </Fragment>
          ),
        }),
        type: 'warning',
      })
    }
  }

  if (!appliesToAllCatalog && appliesToBrands.length) {
    if (promotion.scope.brandsAreInclusive) {
      descriptionParts.push({
        text: formatMessage(messages.promotionsBrandsOnly, {
          count: appliesToBrands.length,
          brands: (
            <Fragment
              key={`promotion-${promotion.idCalculatorConfiguration}-brands-only`}
            >
              {formatList(appliesToBrands)}
            </Fragment>
          ),
        }),
        type: 'warning',
      })
    } else {
      descriptionParts.push({
        text: formatMessage(messages.promotionsBrandsExclude, {
          count: appliesToBrands.length,
          brands: (
            <Fragment
              key={`promotion-${promotion.idCalculatorConfiguration}-brands-exclude`}
            >
              {formatList(appliesToBrands)}
            </Fragment>
          ),
        }),
        type: 'warning',
      })
    }
  }

  if (!appliesToAllCatalog && appliesToCollections.length) {
    if (promotion.scope.collectionsAreInclusive) {
      descriptionParts.push({
        text: formatMessage(messages.promotionsCollectionsOnly, {
          count: appliesToCollections.length,
          collections: (
            <Fragment
              key={`promotion-${promotion.idCalculatorConfiguration}-collections-only`}
            >
              {formatList(appliesToCollections)}
            </Fragment>
          ),
        }),
        type: 'warning',
      })
    } else {
      descriptionParts.push({
        text: formatMessage(messages.promotionsCollectionsExclude, {
          count: appliesToCollections.length,
          collections: (
            <Fragment
              key={`promotion-${promotion.idCalculatorConfiguration}-collections-exclude`}
            >
              {formatList(appliesToCollections)}
            </Fragment>
          ),
        }),
        type: 'warning',
      })
    }
  }

  if (
    promotion.accumulateWithManualPrice !== null &&
    !promotion.accumulateWithManualPrice
  ) {
    descriptionParts.push({
      text: formatMessage(messages.promotionsManualPriceExclude),
      type: 'warning',
    })
  }

  return {
    id: promotion.idCalculatorConfiguration,
    title,
    descriptionParts,
  }
}

export function sortPromotions<T extends Promotion>(a: T, b: T) {
  const minValueA = a.totalValueFloor > 0 && a.totalValueFloor
  const minValueB = b.totalValueFloor > 0 && b.totalValueFloor

  if (minValueA && minValueB && minValueA !== minValueB) {
    return minValueA - minValueB
  }

  if (minValueA) return -1

  if (minValueB) return 1

  if (a.scope.allCatalog === b.scope.allCatalog) return 0

  if (a.scope.allCatalog) return -1

  return 1
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
  const promotionItems = data?.getAllPromotions
  const intl = useIntl()

  const promotions: PromotionCardData[] = useMemo(() => {
    if (!promotionItems) return []

    return promotionItems
      .sort(sortPromotions)
      .map((p: Promotion) =>
        parsePromotion({
          promotion: p,
          orderForm,
          priceFormatter,
          intl,
        })
      )
      .filter((p: PromotionCardData | null): p is PromotionCardData =>
        Boolean(p)
      )
  }, [intl, orderForm, priceFormatter, promotionItems])

  return { promotions, loading: loading || orderFormLoading }
}
