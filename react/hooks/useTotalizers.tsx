import React from 'react'
import { useIntl } from 'react-intl'
import { FormattedPrice } from 'vtex.formatted-price'
import type { OrderForm, Totalizer } from 'vtex.checkout-graphql'

import { messages } from '../utils'

export function useTotalizers(
  totalizers: Totalizer[],
  shipping: OrderForm['shipping'],
  total: number
) {
  const { formatMessage } = useIntl()

  if (!totalizers.length) return null

  let formattedAddress = formatMessage(messages.emptyAddress)

  if (shipping?.selectedAddress) {
    const { street, number, city, state } = shipping?.selectedAddress

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
