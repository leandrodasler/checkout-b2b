import React from 'react'
import { useIntl } from 'react-intl'
import { SavedCartStatus } from 'ssesandbox04.checkout-b2b'
import { Tag } from 'vtex.styleguide'

import { getCartStatusColor, savedCartStatusMessages } from '../utils'

type Props = {
  status: SavedCartStatus
}

export function SavedCartStatusBadge({ status }: Props) {
  const { formatMessage } = useIntl()
  const statusMessage = formatMessage(savedCartStatusMessages[status])

  return <Tag bgColor={getCartStatusColor(status)}>{statusMessage}</Tag>
}
