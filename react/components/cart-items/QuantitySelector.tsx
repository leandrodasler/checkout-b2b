import React, { useCallback, useEffect, useRef } from 'react'
import { useIntl } from 'react-intl'
import { OrderItems } from 'vtex.order-items'
import { NumericStepper } from 'vtex.styleguide'

import { useCheckoutB2BContext } from '../../CheckoutB2BContext'
import { useToast } from '../../hooks'
import { CustomItem } from '../../typings'
import { isItemUnavailable, messages } from '../../utils'

const { useOrderItems } = OrderItems
const DELAY = 500

type Props = { item: CustomItem; disabled?: boolean; minQuantity?: number }

export function QuantitySelector({ item, disabled, minQuantity = 1 }: Props) {
  const showToast = useToast()
  const { formatMessage } = useIntl()
  const timeout = useRef<number>()
  const { updateQuantity } = useOrderItems()
  const { setPending } = useCheckoutB2BContext()
  const [newQuantity, setNewQuantity] = React.useState(item.quantity)
  const handleFinish = useCallback(() => setPending(false), [setPending])

  const handleQuantityChange = useCallback(
    ({ value }: { value: number }) => {
      setNewQuantity(value)

      if (!value) return

      setPending(true)
      clearTimeout(timeout.current)

      timeout.current = window.setTimeout(() => {
        updateQuantity({
          index: item.itemIndex,
          seller: item.seller ?? '1',
          quantity: value,
        }).then(handleFinish, handleFinish)
      }, DELAY)
    },
    [handleFinish, item.itemIndex, item.seller, setPending, updateQuantity]
  )

  useEffect(() => {
    if (item.quantity >= minQuantity) return

    showToast({
      message: `${formatMessage(messages.changeMinimumQuantity)} ${
        item.skuName
      }`,
    })

    updateQuantity({
      index: item.itemIndex,
      seller: item.seller ?? '1',
      quantity: minQuantity,
    })
  }, [
    formatMessage,
    item.itemIndex,
    item.quantity,
    item.seller,
    item.skuName,
    minQuantity,
    showToast,
    updateQuantity,
  ])

  useEffect(() => {
    setNewQuantity(item.quantity < minQuantity ? minQuantity : item.quantity)
  }, [item.quantity, minQuantity])

  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const input = ref.current?.querySelector('input')

    if (!input) return

    if (disabled) {
      input.setAttribute('disabled', 'true')
    } else {
      input.removeAttribute('disabled')
    }
  }, [disabled])

  if (isItemUnavailable(item)) {
    return (
      <div className="w-100 tc c-danger">
        {formatMessage(messages.itemUnavailable)}
      </div>
    )
  }

  return (
    <div ref={ref}>
      <NumericStepper
        size="small"
        value={newQuantity}
        minValue={minQuantity}
        onChange={handleQuantityChange}
        readOnly={disabled}
      />
    </div>
  )
}
