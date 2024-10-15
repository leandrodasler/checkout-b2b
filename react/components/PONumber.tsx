import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { Input } from 'vtex.styleguide'

import { messages } from '../utils'

export function PONumber() {
  const { formatMessage } = useIntl()
  const [selectedPONumber, setSelectedPoNumber] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedPoNumber(e.target.value)
  }

  return (
    <div className="mb5">
      <Input
        placeholder={formatMessage(messages.PONumber)}
        type="number"
        value={selectedPONumber ?? ''}
        dataAttributes={{ 'hj-white-list': true, test: 'string' }}
        onChange={handleChange}
      />
    </div>
  )
}
