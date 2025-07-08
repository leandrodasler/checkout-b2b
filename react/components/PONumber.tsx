import React, { useEffect } from 'react'
import { useIntl } from 'react-intl'
import { Input } from 'vtex.styleguide'

import { useCheckoutB2BContext } from '../CheckoutB2BContext'
import { useOrderFormCustom } from '../hooks'
import {
  B2B_CHECKOUT_CUSTOM_APP_ID,
  messages,
  PO_NUMBER_CUSTOM_FIELD,
} from '../utils'

export function PONumber() {
  const { formatMessage } = useIntl()
  const { orderForm } = useOrderFormCustom()
  const { poNumber, setPoNumber } = useCheckoutB2BContext()

  const orderFormPoNumber =
    orderForm.customData?.customApps?.find(
      (app) => app.id === B2B_CHECKOUT_CUSTOM_APP_ID
    )?.fields?.[PO_NUMBER_CUSTOM_FIELD] ?? ''

  useEffect(() => {
    setPoNumber(orderFormPoNumber)
  }, [orderFormPoNumber, setPoNumber])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPoNumber(e.target.value)
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
