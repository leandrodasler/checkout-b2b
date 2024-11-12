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

  const numberFormatted = number ? `, ${number}` : ', N/A'
  const complementFormatted = complement
    ? `, ${complement}`
    : `, ${formatMessage(messages.noComplement)}`

  const postalCodeFormatted = postalCode ? ` - ${postalCode}` : ' - N/A'
  const neighborhoodFormatted = neighborhood ? `${neighborhood}, ` : 'N/A'

  return (
    <>
      {street}
      {numberFormatted}
      {complementFormatted}
      {postalCodeFormatted}
      <br />
      {neighborhoodFormatted}
      {city}, {state}, {formatMessage({ id: `country.${country}` })}
    </>
  )
}
