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
  const [customPrice, setCustomPrice] = useState<string>(
    String((rowData.sellingPrice ?? 0) / 100)
  )

  const originalPrice = rowData.sellingPrice ?? 0
  const discountedPrice = originalPrice * (1 - sliderValue / 100)

  useEffect(() => {
    if (sliderValue !== 0) {
      onUpdatePrice(rowData.id, discountedPrice)
    } else {
      onUpdatePrice(rowData.id, parseFloat(customPrice) * 100 || 0)
    }
  }, [discountedPrice, onUpdatePrice, rowData.id, sliderValue, customPrice])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value

    setCustomPrice(inputValue) // Apenas atualiza o valor digitado
  }

  const handleInputBlur = () => {
    const newValue = parseFloat(customPrice.replace(',', '.'))

    if (newValue) {
      setCustomPrice(newValue.toFixed(2)) // Formata ao sair do campo
      onUpdatePrice(rowData.id, newValue * 100)
    }
  }

  if (isEditing && sliderValue === 0) {
    return (
      <div style={{ minWidth: 110 }}>
        <Input
          size="small"
          value={customPrice} // Mostra o valor atual como está
          onChange={handleInputChange} // Permite digitação fluida
          onBlur={handleInputBlur} // Formata ao sair do campo
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
