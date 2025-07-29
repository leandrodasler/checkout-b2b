import React, { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import type { Item } from 'vtex.checkout-graphql'
import { FormattedPrice } from 'vtex.formatted-price'
import { useRuntime } from 'vtex.render-runtime'
import {
  IconArrowDown,
  IconArrowUp,
  InputCurrency,
  Tooltip,
} from 'vtex.styleguide'

import { useFormatPrice } from '../hooks'
import { messages } from '../utils'

interface ManualPriceProps {
  rowData: Item
  isEditing: boolean
  sliderValue: number
  onUpdatePrice: (id: string, newPrice: number) => void
}

export default function ManualPrice({
  rowData,
  isEditing,
  sliderValue,
  onUpdatePrice,
}: ManualPriceProps) {
  const formatPrice = useFormatPrice()
  const { formatMessage } = useIntl()

  const {
    culture: { locale, currency },
  } = useRuntime()

  const originalPrice = (rowData.sellingPrice ?? 0) / 100
  const [customPrice, setCustomPrice] = useState<number>(originalPrice)

  const price = (rowData.price ?? 0) / 100
  const manualPrice = (rowData.manualPrice ?? 0) / 100
  const discountedPrice =
    ((rowData.sellingPrice ?? 0) * (1 - sliderValue / 100)) / 100

  const priceDefinition =
    (rowData.priceDefinition?.calculatedSellingPrice ?? 0) / 100

  useEffect(() => {
    if (!isEditing || sliderValue === 0) {
      setCustomPrice(originalPrice)
    }
  }, [originalPrice, isEditing, sliderValue])

  useEffect(() => {
    onUpdatePrice(rowData.id, Math.round(customPrice * 100))
  }, [customPrice, onUpdatePrice, rowData.id])

  const handleInputCurrencyChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = Number(e.target.value)

    if (!Number.isNaN(value)) {
      setCustomPrice(value)
    }
  }

  const isEditingAvailable = isEditing && sliderValue === 0

  const showChangeIndicator =
    (isEditingAvailable && customPrice !== originalPrice) ||
    (manualPrice !== 0 && manualPrice !== price) ||
    price !== priceDefinition

  const priceIncreased = customPrice > originalPrice || manualPrice > price

  const difference = manualPrice ? price - manualPrice : price - priceDefinition

  const tooltipLabel = `${difference > 0 ? '-' : '+'}${formatPrice(
    Math.abs(isEditingAvailable ? price - customPrice : difference)
  )}`

  return (
    <div className="flex items-center w-100">
      {isEditingAvailable ? (
        <div
          style={{
            transform: 'scale(0.8)',
            transformOrigin: 'left',
          }}
        >
          <div style={{ width: showChangeIndicator ? '120%' : '100%' }}>
            <InputCurrency
              size="small"
              placeholder={formatMessage(messages.manualPricePlaceholder)}
              locale={locale}
              currencyCode={currency}
              value={customPrice}
              onChange={handleInputCurrencyChange}
            />
          </div>
        </div>
      ) : (
        <FormattedPrice
          value={sliderValue > 0 ? discountedPrice : customPrice || 0}
        />
      )}
      {showChangeIndicator && (
        <Tooltip label={tooltipLabel}>
          <span className={`ml3 ${priceIncreased ? 'c-success' : 'c-danger'}`}>
            {priceIncreased ? (
              <IconArrowUp size={12} />
            ) : (
              <IconArrowDown size={12} />
            )}
          </span>
        </Tooltip>
      )}
    </div>
  )
}
