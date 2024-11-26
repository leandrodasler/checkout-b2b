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
  const [isInputVisible, setIsInputVisible] = useState(isEditing)
  const [customPrice, setCustomPrice] = useState<string>(
    String(rowData.sellingPrice ?? 0)
  )

  const originalPrice = rowData.sellingPrice ?? 0
  const discountedPrice = originalPrice * (1 - sliderValue / 100)

  useEffect(() => {
    if (sliderValue !== 0) {
      onUpdatePrice(rowData.id, discountedPrice)
    }
  }, [discountedPrice, onUpdatePrice, rowData.id, sliderValue])

  useEffect(() => {
    setIsInputVisible(isEditing)
  }, [isEditing])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace('R$', '').replace(',', '.').trim()
    const newValue = parseFloat(inputValue)

    setCustomPrice(String(newValue * 100))
  }

  const formattedPrice = (value: number) =>
    `R$ ${(value / 100).toFixed(2).replace('.', ',')}`

  if (isInputVisible && sliderValue === 0) {
    return (
      <div style={{ minWidth: 110 }}>
        <Input
          size="small"
          value={formattedPrice(Number(customPrice))}
          onChange={handleInputChange}
        />
      </div>
    )
  }

  return (
    <FormattedPrice
      value={
        sliderValue > 0 ? discountedPrice / 100 : Number(customPrice) / 100
      }
    />
  )
}
