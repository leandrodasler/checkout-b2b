import React, { useEffect, useState } from 'react'
import type { Item } from 'vtex.checkout-graphql'
import { FormattedPrice } from 'vtex.formatted-price'
import { Input } from 'vtex.styleguide'

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
  const initialPrice = String((rowData.sellingPrice ?? 0) / 100)
  const [customPrice, setCustomPrice] = useState<string>(initialPrice)
  const discountedPrice = (rowData.sellingPrice ?? 0) * (1 - sliderValue / 100)

  useEffect(() => {
    if (!isEditing) {
      setCustomPrice(initialPrice)
    }
  }, [initialPrice, isEditing])

  useEffect(() => {
    const numericPrice = parseFloat(customPrice.replace(',', '.'))

    if (numericPrice) {
      onUpdatePrice(rowData.id, numericPrice * 100 || 0)
    }
  }, [customPrice, onUpdatePrice, rowData.id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomPrice(e.target.value)
  }

  const handleInputBlur = () => {
    const newValue = parseFloat(customPrice.replace(',', '.'))

    if (newValue) {
      setCustomPrice(newValue.toFixed(2))
    }
  }

  if (isEditing && sliderValue === 0) {
    return (
      <div style={{ minWidth: 110 }}>
        <Input
          size="small"
          value={customPrice}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          placeholder="Enter price"
        />
      </div>
    )
  }

  return (
    <FormattedPrice
      value={
        sliderValue > 0 ? discountedPrice / 100 : parseFloat(customPrice) || 0
      }
    />
  )
}
