import React, { useMemo } from 'react'
import { useIntl } from 'react-intl'
import { FormattedPrice } from 'vtex.formatted-price'
import { IconHelp, Tooltip } from 'vtex.styleguide'

import { useOrderFormCustom, useTotalMargin } from '.'
import { useCheckoutB2BContext } from '../CheckoutB2BContext'
import { PaymentData } from '../components/PaymentData'
import { PONumber } from '../components/PONumber'
import { TruncatedText } from '../components/TruncatedText'
import { messages } from '../utils'

export function useTotalizers() {
  const { discountApplied, percentualDiscount } = useCheckoutB2BContext()
  const { formatMessage } = useIntl()
  const { orderForm } = useOrderFormCustom()

  const { totalizers = [], value: total = 0, items } = orderForm

  const hasQuotationDiscount = useMemo(
    () =>
      items?.some(
        (item) => item.manualPrice && item.manualPrice !== item.price
      ),
    [items]
  )

  const totalMargin = useTotalMargin()

  if (!totalizers.length || !items?.length) return []

  const totalPriceWithDiscount = total - (total * discountApplied) / 100

  const totalItems = items.reduce(
    (acc, item) => acc + (item.sellingPrice ?? 0) * item.quantity,
    0
  )

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
      label: formatMessage(messages.totalDiscount),
      value: `${Math.round(percentualDiscount + discountApplied)}%`,
    },
    ...totalizers.map((t) => ({
      label: t.name,
      value: (
        <div className="flex flex-wrap">
          <TruncatedText
            text={<FormattedPrice value={t.value / 100} />}
            strike={t.id === 'Items' && totalItems < t.value}
          />
          {t.id === 'Items' && totalItems < t.value && (
            <div className="w-100">
              <TruncatedText
                text={<FormattedPrice value={totalItems / 100} />}
              />
            </div>
          )}
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
