import React, { useEffect, useState } from 'react'
import type { Item } from 'vtex.checkout-graphql'
import { FormattedPrice } from 'vtex.formatted-price'
import { useRuntime } from 'vtex.render-runtime'
import { InputCurrency } from 'vtex.styleguide'

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
  const {
    culture: { locale, currency },
  } = useRuntime()

  const [customPrice, setCustomPrice] = useState<number>(
    (rowData.sellingPrice ?? 0) / 100
  )

  const discountedPrice = (rowData.sellingPrice ?? 0) * (1 - sliderValue / 100)

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

  if (isEditing && sliderValue === 0) {
    return (
      <div style={{ minWidth: 110, transform: 'scale(0.85)' }}>
        <InputCurrency
          size="small"
          placeholder="Type a monetary value"
          locale={locale}
          currencyCode={currency}
          value={customPrice}
          onChange={handleInputCurrencyChange}
        />
      </div>
    )
  }

  return (
    <>
      <FormattedPrice
        value={sliderValue > 0 ? discountedPrice / 100 : customPrice || 0}
      />
    </>
  )
}
