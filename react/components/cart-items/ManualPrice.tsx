import React from 'react'
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

import { useFormatPrice } from '../../hooks'
import { useManualPrice } from '../../hooks/useManualPrice'
import { isItemUnavailable, messages } from '../../utils'

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
  const formatPrice = useFormatPrice()
  const {
    culture: { locale, currency },
  } = useRuntime()

  const discountedPrice =
    ((rowData.sellingPrice ?? 0) * (1 - sliderValue / 100)) / 100

  const displayPrice = sliderValue > 0 ? discountedPrice : discountedPrice || 0

  const {
    inputPrice,
    handleInputChange,
    tooltipLabelValue,
    showChangeIndicator,
    isPriceIncreased,
    canEditPrice,
  } = useManualPrice({
    item: rowData,
    sliderValue,
    isEditing,
    onUpdatePrice,
  })

  if (isItemUnavailable(rowData)) {
    return <>---</>
  }

  const tooltipLabel = `${tooltipLabelValue > 0 ? '-' : '+'}${formatPrice(
    Math.abs(tooltipLabelValue)
  )}`

  return (
    <div className="flex items-center w-100">
      {canEditPrice ? (
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
              value={inputPrice}
              onChange={handleInputChange}
            />
          </div>
        </div>
      ) : (
        <FormattedPrice value={displayPrice} />
      )}

      {showChangeIndicator && (
        <Tooltip label={tooltipLabel}>
          <span
            className={`ml3 ${isPriceIncreased ? 'c-success' : 'c-danger'}`}
          >
            {isPriceIncreased ? (
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
