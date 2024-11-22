import React, { useEffect, useState } from 'react'
import type { Item } from 'vtex.checkout-graphql'
import { FormattedPrice } from 'vtex.formatted-price'
import { Input } from 'vtex.styleguide'

interface ManualPriceProps {
  rowData: Item
  isEditing: boolean
  sliderValue: number
}

export default function ManualPrice({
  rowData,
  isEditing,
  sliderValue,
}: ManualPriceProps) {
  const [isInputVisible, setIsInputVisible] = useState(isEditing)
  const [customPrice, setCustomPrice] = useState<string>(
    String(rowData.sellingPrice ?? 0)
  )

  useEffect(() => {
    setIsInputVisible(isEditing)
  }, [isEditing])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue =
      parseFloat(e.target.value.replace('R$', '').replace(',', '.')) * 100

    setCustomPrice(String(newValue ? 0 : newValue))
  }

  const originalPrice = rowData.sellingPrice ?? 0
  const discountedPrice = originalPrice * (1 - sliderValue / 100)

  const formattedPrice = (value: number) =>
    `R$ ${(value / 100).toFixed(2).replace('.', ',')}`

  return isInputVisible && sliderValue === 0 ? (
    <div style={{ minWidth: 110 }}>
      <Input
        size="small"
        value={formattedPrice(Number(customPrice))}
        onChange={handleInputChange}
      />
    </div>
  ) : (
    <>
      <FormattedPrice
        value={
          sliderValue > 0 ? discountedPrice / 100 : Number(customPrice) / 100
        }
      />
    </>
  )
}
