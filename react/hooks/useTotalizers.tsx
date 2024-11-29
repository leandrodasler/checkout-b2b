import React, { useMemo } from 'react'
import { useIntl } from 'react-intl'
import { FormattedPrice } from 'vtex.formatted-price'
import { IconHelp, Tooltip } from 'vtex.styleguide'

import { PaymentData } from '../components/PaymentData'
import { PONumber } from '../components/PONumber'
import { TruncatedText } from '../components/TruncatedText'
import { B2B_QUOTES_CUSTOM_APP_ID, messages } from '../utils'
import { useTotalMargin } from './useFetchPrices'
import { useOrderFormCustom } from './useOrderFormCustom'

export function useTotalizers() {
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

  return [
    {
      label: formatMessage(messages.paymentMethods),
      value: <PaymentData />,
    },
    {
      label: formatMessage(messages.PONumber),
      value: <PONumber />,
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
      value: <TruncatedText text={<FormattedPrice value={total / 100} />} />,
    },
  ]
}
