import React from 'react'
import { useIntl } from 'react-intl'
import type { Address as OrganizationAddress } from 'vtex.b2b-organizations-graphql'
import type { Address as AddressType } from 'vtex.checkout-graphql'

import { messages } from '../utils'

type Props = { address?: AddressType | OrganizationAddress | null }

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
  const neighborhoodFormatted = neighborhood ? `, ${neighborhood}` : ''
  const postalCodeFormatted = postalCode
    ? ` - ${formatMessage({
        id: 'address-form.field.postalCode',
      })}: ${postalCode}`
    : ''

  return (
    <>
      {street}
      {numberFormatted}
      {complementFormatted}
      {neighborhoodFormatted}, {city}, {state},{' '}
      {formatMessage({ id: `country.${country}` })}
      {postalCodeFormatted}
    </>
  )
}
