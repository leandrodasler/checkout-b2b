import React from 'react'
import { useIntl } from 'react-intl'
import { TranslateEstimate } from 'vtex.shipping-estimate-translator'
import { ShippingSla } from 'vtex.store-graphql'
import { Dropdown, Spinner } from 'vtex.styleguide'

import { messages } from '../../utils'

type Props = {
  selectedSla?: ShippingSla | null
  options: Array<{
    value?: string | null
    label: React.ReactNode
  }>
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  isLoading?: boolean
  showEstimateDate?: boolean
  variation?: 'default' | 'inline'
  shippingEstimates?: Array<string | null | undefined>
  disabled?: boolean
  itemCountBySelectedEstimate?: Record<string, number>
}

const SlaDropdownSpinner = () => (
  <div className="w-100 flex justify-center">
    <Spinner size={12} />
  </div>
)

export function SlaDropdown({
  selectedSla,
  options,
  onChange,
  isLoading,
  variation = 'default',
  showEstimateDate = true,
  shippingEstimates,
  disabled,
  itemCountBySelectedEstimate,
}: Props) {
  const { formatMessage } = useIntl()

  if (isLoading && !showEstimateDate) return <SlaDropdownSpinner />

  return (
    <div className="w-100">
      <Dropdown
        disabled={disabled}
        variation={variation}
        size="small"
        placeholder={formatMessage(messages.shippingOption)}
        options={options}
        value={selectedSla?.id}
        onChange={onChange}
        {...(showEstimateDate && {
          helpText: isLoading ? (
            <SlaDropdownSpinner />
          ) : shippingEstimates ? (
            <div className="t-mini flex flex-column">
              {shippingEstimates.map((shippingEstimate) => (
                <span key={shippingEstimate}>
                  {!!shippingEstimate &&
                    itemCountBySelectedEstimate?.[shippingEstimate] && (
                      <>
                        {formatMessage(messages.itemCount, {
                          count: itemCountBySelectedEstimate[shippingEstimate],
                        })}
                        :{' '}
                      </>
                    )}
                  <TranslateEstimate shippingEstimate={shippingEstimate} />
                </span>
              ))}
            </div>
          ) : (
            <span className="t-mini">
              <TranslateEstimate
                shippingEstimate={selectedSla?.shippingEstimate}
              />
            </span>
          ),
        })}
      />
    </div>
  )
}
