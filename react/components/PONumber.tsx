import React from 'react'
import { useIntl } from 'react-intl'
import { Input } from 'vtex.styleguide'

import { useOrderFormCustom } from '../hooks'
import type { CompleteOrderForm } from '../typings'
import {
  B2B_CHECKOUT_CUSTOM_APP_ID,
  B2B_CHECKOUT_CUSTOM_APP_MAJOR,
  messages,
  PO_NUMBER_CUSTOM_FIELD,
} from '../utils'

export function PONumber() {
  const { formatMessage } = useIntl()
  const { orderForm, setOrderForm } = useOrderFormCustom()

  const poNumber =
    orderForm.customData?.customApps?.find(
      (app) => app.id === B2B_CHECKOUT_CUSTOM_APP_ID
    )?.fields?.[PO_NUMBER_CUSTOM_FIELD] ?? ''

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOrderForm({
      ...orderForm,
      paymentAddress: orderForm.paymentAddress,
      customData: !e.target.value
        ? null
        : {
            ...orderForm.customData,
            customApps: [
              {
                id: B2B_CHECKOUT_CUSTOM_APP_ID,
                major: B2B_CHECKOUT_CUSTOM_APP_MAJOR,
                fields: {
                  [PO_NUMBER_CUSTOM_FIELD]: e.target.value,
                },
              },
            ],
          },
    } as CompleteOrderForm)
  }

  return (
    <Input
      size="small"
      placeholder={formatMessage(messages.PONumberPlaceholder)}
      onChange={handleChange}
      value={poNumber}
    />
  )
}
