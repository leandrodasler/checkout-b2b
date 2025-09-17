import React, { useEffect, useMemo, useRef } from 'react'
import { useIntl } from 'react-intl'
import { FormattedPrice } from 'vtex.formatted-price'
import { IconHelp, Tooltip } from 'vtex.styleguide'

import {
  useFormatPrice,
  useOrderFormCustom,
  usePermissions,
  useTaxes,
  useTotalMargin,
} from '.'
import { useCheckoutB2BContext } from '../CheckoutB2BContext'
import { PaymentData } from '../components/PaymentData'
import { PONumber } from '../components/PONumber'
import { TruncatedText } from '../components/TruncatedText'
import { messages } from '../utils'

export function useTotalizers() {
  const { discountApplied } = useCheckoutB2BContext()
  const { formatMessage } = useIntl()
  const formatPrice = useFormatPrice()
  const { orderForm } = useOrderFormCustom()
  const { isSalesUser } = usePermissions()
  const { totalizers = [], items, value: total } = orderForm

  const hasQuotationDiscount = useMemo(
    () =>
      items?.some(
        (item) => item.manualPrice && item.manualPrice !== item.price
      ),
    [items]
  )

  const { totalMargin } = useTotalMargin()
  const prevMarginRef = useRef(totalMargin)

  useEffect(() => {
    if (!totalMargin) return
    prevMarginRef.current = totalMargin
  }, [totalMargin])

  const { data: taxes } = useTaxes()

  const taxTotalizers: Record<string, number> = {}

  if ((taxes?.length ?? 0) > 1) {
    items.forEach((item) => {
      item.priceTags.forEach((tag) => {
        if (
          tag.name?.includes('tax@price') &&
          tag.identifier &&
          tag.rawValue &&
          item.sellingPrice
        ) {
          taxTotalizers[tag.identifier] = taxTotalizers[tag.identifier] ?? 0

          if (tag.isPercentual) {
            taxTotalizers[tag.identifier] +=
              tag.rawValue * item.sellingPrice * item.quantity
          } else if (tag.value) {
            taxTotalizers[tag.identifier] += tag.value
          }
        }
      })
    })
  }

  if (!totalizers.length || !items?.length) return []

  const totalItemsWithoutDiscount =
    totalizers.find((t) => t.id === 'Items')?.value ?? 0

  const totalItems = items.reduce(
    (acc, item) => acc + (item.sellingPrice ?? 0) * item.quantity,
    0
  )

  const percentualDiscount = Math.round(
    100 - (totalItems / totalItemsWithoutDiscount) * 100
  )

  const totalDiscount = Math.round(percentualDiscount + discountApplied)

  const shippingTotalizer = totalizers.find((t) => t.id === 'Shipping')
  const canSeeDiscount = isSalesUser || (!isSalesUser && totalDiscount > 0)
  const filteredTotalizers = totalizers.filter((t) => {
    if (t.id === 'Shipping') return false
    if (t.id === 'Discounts') return canSeeDiscount

    return true
  })

  return [
    {
      label: formatMessage(messages.paymentMethods),
      value: <PaymentData />,
    },
    {
      label: formatMessage(messages.PONumber),
      value: <PONumber />,
    },
    ...(totalDiscount && canSeeDiscount
      ? [
          {
            label:
              totalDiscount < 0
                ? formatMessage(messages.surplus)
                : formatMessage(messages.totalDiscount),
            value: `${Math.abs(totalDiscount)}%`,
          },
        ]
      : []),
    ...filteredTotalizers.map((t) => ({
      label:
        t.id === 'Tax'
          ? formatMessage(messages.tax)
          : t.id === 'Discounts' && t.value > 0
          ? formatMessage(messages.totalSurplus)
          : t.name,
      value: (
        <div className="flex flex-wrap">
          {t.id === 'Items' && canSeeDiscount && totalItems !== t.value && (
            <TruncatedText
              text={<FormattedPrice value={t.value / 100} />}
              strike
            />
          )}
          {(t.id !== 'Items' || totalItems === t.value) && (
            <TruncatedText text={<FormattedPrice value={t.value / 100} />} />
          )}
          {t.id === 'Tax' && taxes?.length && (
            <div className="flex flex-wrap flex-column w-100 t-mini">
              {taxes.map((tax) => (
                <div
                  className="flex flex-wrap"
                  key={tax.idCalculatorConfiguration}
                >
                  {tax.name}
                  {taxes.length > 1 && (
                    <>
                      :{' '}
                      <FormattedPrice
                        value={
                          taxTotalizers[tax.idCalculatorConfiguration] / 100
                        }
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
          {t.id === 'Items' && totalItems !== t.value && (
            <div className="flex flex-wrap w-100">
              <TruncatedText
                text={<FormattedPrice value={totalItems / 100} />}
              />

              {!canSeeDiscount && totalDiscount < 0 && (
                <Tooltip label={formatMessage(messages.quotationTotalItems)}>
                  <span className="ml2">
                    <IconHelp />
                  </span>
                </Tooltip>
              )}
            </div>
          )}
          {t.id === 'Discounts' && hasQuotationDiscount && (
            <Tooltip
              label={
                t.value > 0
                  ? formatMessage(messages.quotationSurplus)
                  : formatMessage(messages.quotationDiscount)
              }
            >
              <span className="ml2">
                <IconHelp />
              </span>
            </Tooltip>
          )}
        </div>
      ),
    })),
    ...(totalMargin || prevMarginRef.current
      ? [
          {
            label: formatMessage(messages.totalMargin),
            value: (
              <TruncatedText text={<FormattedPrice value={totalMargin} />} />
            ),
          },
        ]
      : []),
    ...(shippingTotalizer
      ? [
          {
            label: shippingTotalizer.name,
            value: formatPrice(shippingTotalizer.value / 100),
          },
        ]
      : []),
    {
      label: formatMessage(messages.total),
      value: formatPrice(total / 100),
    },
  ]
}
