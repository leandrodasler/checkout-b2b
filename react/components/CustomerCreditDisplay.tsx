import React from 'react'
import { useIntl } from 'react-intl'
import { FormattedPrice } from 'vtex.formatted-price'

import { messages } from '../utils'

interface CustomerCreditDisplayProps {
  availableCredit: number | undefined
}

const CustomerCreditDisplay = ({
  availableCredit,
}: CustomerCreditDisplayProps) => {
  const { formatMessage } = useIntl()

  if (availableCredit) {
    return (
      <>
        {formatMessage(messages.creditAvailable)}
        <br />
        <strong>
          <FormattedPrice value={availableCredit} />
        </strong>
      </>
    )
  }

  return <span>{formatMessage(messages.noCreditAvailable)}</span>
}

export default CustomerCreditDisplay
