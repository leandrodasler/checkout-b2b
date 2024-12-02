import React, { useCallback, useEffect, useRef } from 'react'
import { useQuery } from 'react-apollo'
import { useIntl } from 'react-intl'
import type { Item } from 'vtex.checkout-graphql'
import { OrderItems } from 'vtex.order-items'
import { NumericStepper, withToast } from 'vtex.styleguide'

import { useCheckoutB2BContext } from '../CheckoutB2BContext'
import GET_PRODUCTS from '../graphql/productQuery.graphql'
import { useOrderFormCustom } from '../hooks'
import type { WithToast } from '../typings'
import { isWithoutStock, messages } from '../utils'

const { useOrderItems } = OrderItems
const DELAY = 500

type Props = { item: Item } & WithToast

function QuantitySelectorComponent({ item, showToast }: Props) {
  const { formatMessage } = useIntl()
  const timeout = useRef<number>()
  const { updateQuantity } = useOrderItems()
  const { setPending } = useCheckoutB2BContext()
  const { orderForm } = useOrderFormCustom()
  const { items } = orderForm

  const [newQuantity, setNewQuantity] = React.useState(item.quantity)
  const [minQuantity, setMinQuantity] = React.useState<number>(1)

  const handleFinish = useCallback(() => setPending(false), [setPending])

  const handleQuantityChange = useCallback(
    ({ value }: { value: number }) => {
      setNewQuantity(value)

      if (!value) return

      setPending(true)
      clearTimeout(timeout.current)

      timeout.current = window.setTimeout(() => {
        updateQuantity({
          id: item.id,
          seller: item.seller ?? '1',
          quantity: value,
        }).then(handleFinish, handleFinish)
      }, DELAY)
    },
    [handleFinish, item.id, item.seller, setPending, updateQuantity]
  )

  useQuery(GET_PRODUCTS, {
    skip: !items?.length,
    variables: { values: items.map((orderItem) => orderItem.productId) },
    onCompleted: (data) => {
      const product = data.productsByIdentifier.find(
        (p: { productId?: string }) => p.productId === item.productId
      )

      if (!product) return

      const minQuantityProp = product.properties?.find(
        (prop: { originalName: string }) => prop.originalName === 'minQuantity'
      )

      const minQuantityValue = Number(minQuantityProp?.values[0] || 1)

      setMinQuantity(minQuantityValue)
      if (item.quantity < minQuantityValue) {
        showToast?.({
          message: `${formatMessage(messages.changeMinimumQuantity)} ${
            item.skuName
          }`,
        })
        updateQuantity({
          id: item.id,
          seller: item.seller ?? '1',
          quantity: minQuantityValue,
        })
      }
    },
  })

  useEffect(() => {
    setNewQuantity(item.quantity < minQuantity ? minQuantity : item.quantity)
  }, [item.quantity, minQuantity])

  if (isWithoutStock(item)) {
    return (
      <div className="w-100 tc c-danger">
        {formatMessage(messages.withoutStock)}
      </div>
    )
  }

  return (
    <NumericStepper
      size="small"
      value={newQuantity}
      minValue={minQuantity}
      onChange={handleQuantityChange}
    />
  )
}

export const QuantitySelector = withToast(QuantitySelectorComponent)
