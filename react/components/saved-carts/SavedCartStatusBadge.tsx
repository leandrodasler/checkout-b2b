import React from 'react'
import { useIntl } from 'react-intl'
import { SavedCartStatus } from 'ssesandbox04.checkout-b2b'
import { Tag } from 'vtex.styleguide'

import { getCartStatusColor, savedCartStatusMessages } from '../../utils'

type Props = { status: SavedCartStatus }

export function SavedCartStatusBadge({ status }: Props) {
  const { formatMessage } = useIntl()

  return (
    <Tag size="small" bgColor={getCartStatusColor(status)}>
      {formatMessage(savedCartStatusMessages[status])}
    </Tag>
  )
}
