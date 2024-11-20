import React from 'react'
import { useIntl } from 'react-intl'
import type { Address as AddressType } from 'vtex.checkout-graphql'

import { messages } from '../utils'

type Props = { address?: AddressType | null }

export function Address({ address }: Props) {
  const { formatMessage } = useIntl()

  if (!address) {
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
  } = address

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
      {city}, {state}, {formatMessage({ id: `country.${country}` })}
    </>
  )
}
