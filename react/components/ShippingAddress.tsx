import React from 'react'
import { useIntl } from 'react-intl'

import { useOrderFormCustom } from '../hooks'
import { messages } from '../utils'
import { Address } from './Address'

export function ShippingAddress() {
  const { formatMessage } = useIntl()
  const {
    orderForm: { shipping },
  } = useOrderFormCustom()

  if (!shipping?.selectedAddress) {
    return <>{formatMessage(messages.emptyAddress)}</>
  }

  return <Address address={shipping.selectedAddress} />
}
