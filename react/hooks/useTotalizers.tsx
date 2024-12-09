import React, { useMemo, useState } from 'react'
import { useIntl } from 'react-intl'
import { FormattedPrice } from 'vtex.formatted-price'
import { IconHelp, Tooltip } from 'vtex.styleguide'

import { useOrderFormCustom, useOrganization, useTotalMargin } from '.'
import { useFetchCustomerCredit } from './useFetchCustomerCredit'
import CustomerCreditDisplay from '../components/CustomerCreditDisplay'
import { PaymentData } from '../components/PaymentData'
import { PONumber } from '../components/PONumber'
import { TruncatedText } from '../components/TruncatedText'
import {
  B2B_QUOTES_CUSTOM_APP_ID,
  CUSTOMER_CREDIT_KEY,
  messages,
} from '../utils'

export function useTotalizers() {
  const { formatMessage } = useIntl()
  const { orderForm } = useOrderFormCustom()
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null)
  const {
    organization: { salesChannel },
  } = useOrganization()

  const {
    totalizers = [],
    customData,
    value: total = 0,
    items,
    clientProfileData,
  } = orderForm

  const customApps = customData?.customApps

  const { data } = useFetchCustomerCredit({
    email: clientProfileData?.email ?? '',
    skus: items.map((item) => item.id).join(','),
    salesChannel: salesChannel ?? '',
    enabled: paymentMethod === CUSTOMER_CREDIT_KEY,
  })

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
      value: (
        <>
          <div className="mb4">
            <PaymentData onPaymentChange={setPaymentMethod} />
          </div>

          {paymentMethod === CUSTOMER_CREDIT_KEY && (
            <CustomerCreditDisplay availableCredit={data?.availableCredit} />
          )}
        </>
      ),
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
