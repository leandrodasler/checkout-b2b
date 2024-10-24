import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { Input } from 'vtex.styleguide'

import { messages } from '../utils'

export function PONumber() {
  const { formatMessage } = useIntl()
  const [selectedPONumber, setSelectedPoNumber] = useState<string>()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedPoNumber(e.target.value)
  }

  return (
    <Input
      size="small"
      placeholder={formatMessage(messages.PONumberPlaceholder)}
      value={selectedPONumber}
      onChange={handleChange}
    />
  )
}
