import React, { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import type { Item } from 'vtex.checkout-graphql'
import { FormattedPrice } from 'vtex.formatted-price'
import { useRuntime } from 'vtex.render-runtime'
import { IconArrowDown, IconArrowUp, InputCurrency } from 'vtex.styleguide'

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
  const { formatMessage } = useIntl()

  const {
    culture: { locale, currency },
  } = useRuntime()

  const originalPrice = (rowData.sellingPrice ?? 0) / 100
  const [customPrice, setCustomPrice] = useState<number>(originalPrice)
  const discountedPrice = (rowData.sellingPrice ?? 0) * (1 - sliderValue / 100)

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

  const showChangeIndicator = customPrice !== originalPrice && sliderValue === 0
  const priceIncreased = customPrice > originalPrice

  // TODO: fix the logic to handle indicator properly
  return (
    <div className="flex items-center bg-red">
      {isEditing && sliderValue === 0 ? (
        <div>
          <InputCurrency
            size="small"
            placeholder={formatMessage(messages.manualPricePlaceholder)}
            locale={locale}
            currencyCode={currency}
            value={customPrice}
            onChange={handleInputCurrencyChange}
          />
        </div>
      ) : (
        <FormattedPrice
          value={sliderValue > 0 ? discountedPrice / 100 : customPrice || 0}
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
  )
}
