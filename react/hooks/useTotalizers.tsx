import React from 'react'
import { useIntl } from 'react-intl'
import type { OrderForm } from 'vtex.checkout-graphql'
import { FormattedPrice } from 'vtex.formatted-price'

import { PaymentData } from '../components/PaymentData'
import { PONumber } from '../components/PONumber'
import { messages } from '../utils'

export function useTotalizers(form: Partial<OrderForm>) {
  const { formatMessage } = useIntl()
  const total = form.value ?? 0
  const totalizers = form.totalizers ?? []

  if (!totalizers.length) return null

  let formattedAddress = formatMessage(messages.emptyAddress)

  if (form.shipping?.selectedAddress) {
    const { street, number, city, state } = form.shipping?.selectedAddress

    formattedAddress = `${street}${
      number ? `, ${number}` : ''
    } - ${city}, ${state}`
  }

  return [
    {
      label: formatMessage(messages.selectedAddress),
      value: formattedAddress,
      isLoading: false,
    },
    {
      label: formatMessage(messages.paymentMethods),
      value: form.paymentData ? <PaymentData /> : null,
    },
    {
      label: formatMessage(messages.PONumber),
      value: <PONumber />,
    },
    ...totalizers.map((t) => ({
      label: t.name,
      value: <FormattedPrice value={t.value / 100} />,
    })),
    {
      label: formatMessage(messages.total),
      value: <FormattedPrice value={total / 100} />,
    },
  ]
}
