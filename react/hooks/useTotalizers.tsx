import React, { useMemo } from 'react'
import { useIntl } from 'react-intl'
import { FormattedPrice } from 'vtex.formatted-price'
import { IconHelp, Tooltip } from 'vtex.styleguide'

import { useOrderFormCustom, useTotalMargin } from '.'
import { useCheckoutB2BContext } from '../CheckoutB2BContext'
import { PaymentData } from '../components/PaymentData'
import { PONumber } from '../components/PONumber'
import { TruncatedText } from '../components/TruncatedText'
import { B2B_QUOTES_CUSTOM_APP_ID, messages } from '../utils'

export function useTotalizers() {
  const {
    discountApplied,
    setFixedDiscountPercentage,
  } = useCheckoutB2BContext()

  const { formatMessage } = useIntl()
  const { orderForm } = useOrderFormCustom()
  const { totalizers = [], customData, value: total = 0, items } = orderForm
  const customApps = customData?.customApps
  const hasQuotationDiscount = useMemo(
    () =>
      customApps?.find(
        (app) => app.id === B2B_QUOTES_CUSTOM_APP_ID && app.fields?.quoteId
      ),
    [customApps]
  )

  const totalMargin = useTotalMargin()

  if (!totalizers.length || !items?.length) return []

  const totalItems = totalizers.find((t) => t.id === 'Items')?.value ?? 0
  const totalDiscounts =
    totalizers.find((t) => t.id === 'Discounts')?.value ?? 0

  const additionalDiscount = -(discountApplied / 100) * totalItems

  const totalDiscountsWithSlider = totalDiscounts + additionalDiscount

  const discountPercentageWithSlider = totalItems
    ? ((totalDiscountsWithSlider / totalItems) * 100).toFixed(2)
    : 0

  const fixedDiscount = totalItems
    ? ((totalDiscounts / totalItems) * 100).toFixed(2)
    : 0

  setFixedDiscountPercentage(Number(fixedDiscount))

  const totalPriceWithDiscount = total - (total * discountApplied) / 100

  return [
    {
      label: formatMessage(messages.paymentMethods),
      value: <PaymentData />,
    },
    {
      label: formatMessage(messages.PONumber),
      value: <PONumber />,
    },
    {
      label: 'Desconto total (%)',
      value: `${discountPercentageWithSlider}%`,
    },
    ...totalizers.map((t) => ({
      label: t.name,
      value: (
        <div className="flex">
          <TruncatedText text={<FormattedPrice value={t.value / 100} />} />
          {t.id === 'Discounts' && hasQuotationDiscount && (
            <Tooltip label={formatMessage(messages.quotationDiscount)}>
              <span className="ml2">
                <IconHelp />
              </span>
            </Tooltip>
          )}
        </div>
      ),
    })),
    ...(totalMargin
      ? [
          {
            label: formatMessage(messages.totalMargin),
            value: (
              <TruncatedText text={<FormattedPrice value={totalMargin} />} />
            ),
          },
        ]
      : []),
    {
      label: formatMessage(messages.total),
      value: (
        <TruncatedText
          text={<FormattedPrice value={totalPriceWithDiscount / 100} />}
        />
      ),
    },
  ]
}
