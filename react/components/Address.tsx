import React from 'react'
import { useIntl } from 'react-intl'

import { useOrderFormCustom } from '../hooks'
import { messages } from '../utils'

export function Address() {
  const { formatMessage } = useIntl()
  const {
    orderForm: { shipping },
  } = useOrderFormCustom()

  if (!shipping?.selectedAddress) {
    return <>{formatMessage(messages.emptyAddress)}</>
  }

  const {
    street,
    number,
    complement,
    postalCode,
    neighborhood,
    city,
    state,
    country,
  } = shipping.selectedAddress

  const numberFormatted = number ? `, ${number}` : ''
  const complementFormatted = complement ? `, ${complement}` : ''
  const postalCodeFormatted = postalCode ? ` - ${postalCode}` : ''
  const neighborhoodFormatted = neighborhood ? `${neighborhood}, ` : ''

  return (
    <>
      {street}
      {numberFormatted}
      {complementFormatted}
      {postalCodeFormatted}
      <br />
      {neighborhoodFormatted}
      {city}, {state}, {country}
    </>
  )
}
