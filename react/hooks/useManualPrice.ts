import { useEffect, useState } from 'react'
import type { Item } from 'vtex.checkout-graphql'

type UseManualPriceProps = {
  item: Item
  sliderValue: number
  isEditing: boolean
  onUpdatePrice: (id: string, newPrice: number) => void
}

export function useManualPrice({
  item,
  sliderValue,
  isEditing,
  onUpdatePrice,
}: UseManualPriceProps) {
  const originalPrice = (item.sellingPrice ?? 0) / 100
  const calculatedPrice =
    (item.priceDefinition?.calculatedSellingPrice ?? 0) / 100

  const basePrice = (item.price ?? 0) / 100
  const savedManualPrice = (item.manualPrice ?? 0) / 100

  const [inputPrice, setInputPrice] = useState(originalPrice)

  const discountedPrice =
    ((item.sellingPrice ?? 0) * (1 - sliderValue / 100)) / 100

  const canEditPrice = isEditing && sliderValue === 0

  useEffect(() => {
    if (canEditPrice) {
      setInputPrice(originalPrice)
    }
  }, [originalPrice, canEditPrice])

  useEffect(() => {
    onUpdatePrice(item.id, Math.round(inputPrice * 100))
  }, [inputPrice, onUpdatePrice, item.id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value)

    if (!Number.isNaN(value)) {
      setInputPrice(value)
    }
  }

  const priceDiff = canEditPrice
    ? basePrice - inputPrice
    : sliderValue > 0
    ? basePrice - discountedPrice
    : savedManualPrice
    ? basePrice - savedManualPrice
    : basePrice - calculatedPrice

  const showChangeIndicator =
    (sliderValue > 0 && discountedPrice !== originalPrice) ||
    (canEditPrice && inputPrice !== originalPrice) ||
    (savedManualPrice !== 0 && savedManualPrice !== basePrice) ||
    basePrice !== calculatedPrice

  const isPriceIncreased =
    (canEditPrice && inputPrice > basePrice) || savedManualPrice > basePrice

  return {
    inputPrice,
    handleInputChange,
    tooltipLabelValue: priceDiff,
    showChangeIndicator,
    isPriceIncreased,
    canEditPrice,
  }
}
