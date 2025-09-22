import React from 'react'
import { useIntl } from 'react-intl'
import { TranslateEstimate } from 'vtex.shipping-estimate-translator'
import { ShippingSla } from 'vtex.store-graphql'
import { Dropdown, Spinner } from 'vtex.styleguide'

import { messages } from '../utils'

type Props = {
  selectedSla?: ShippingSla | null
  options: Array<{
    value?: string | null
    label: string
  }>
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  isLoading?: boolean
}

export function SlaDropdown(props: Props) {
  const { selectedSla, options, onChange, isLoading } = props
  const { formatMessage } = useIntl()

  return (
    <div className="w-100">
      <Dropdown
        size="small"
        placeholder={formatMessage(messages.shippingOption)}
        options={options}
        value={selectedSla?.id}
        onChange={onChange}
        helpText={
          isLoading ? (
            <Spinner size={12} />
          ) : (
            <span className="t-mini">
              <TranslateEstimate
                shippingEstimate={selectedSla?.shippingEstimate}
              />
            </span>
          )
        }
      />
    </div>
  )
}
