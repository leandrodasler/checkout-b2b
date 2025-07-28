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
  const discountedPrice =
    ((rowData.sellingPrice ?? 0) * (1 - sliderValue / 100)) / 100

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

  const showChangeIndicator = customPrice !== originalPrice && sliderValue === 0
  const priceIncreased = customPrice > originalPrice

  const tooltipLabel = isEditingAvailable ? customPrice : discountedPrice

  // TODO: fix the logic to handle indicator properly
  return (
    <Tooltip label={formatPrice(tooltipLabel)}>
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
          <span className={`ml3 ${priceIncreased ? 'c-danger' : 'c-success'}`}>
            {priceIncreased ? (
              <IconArrowUp size={12} />
            ) : (
              <IconArrowDown size={12} />
            )}
          </span>
        )}
      </div>
    </Tooltip>
  )
}
