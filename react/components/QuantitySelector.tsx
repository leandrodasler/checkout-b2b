import React, { useEffect, useRef } from 'react'
import { useQuery } from 'react-apollo'
import { useIntl } from 'react-intl'
import { Item } from 'vtex.checkout-graphql'
import { OrderItems } from 'vtex.order-items'
import { NumericStepper, Spinner, withToast } from 'vtex.styleguide'

import GET_PRODUCTS from '../graphql/productQuery.graphql'
import { useOrderFormCustom } from '../hooks/useOrderFormCustom'
import { WithToast } from '../typings'
import { isWithoutStock, messages } from '../utils'

const { useOrderItems } = OrderItems
const DELAY = 500

type Props = { item: Item } & WithToast

function QuantitySelectorComponent({ item, showToast }: Props) {
  const { formatMessage } = useIntl()
  const [newQuantity, setNewQuantity] = React.useState(item.quantity)
  const [minQuantity, setMinQuantity] = React.useState<number>(1)
  const timeout = useRef<number>()
  const { updateQuantity } = useOrderItems()

  const { orderForm } = useOrderFormCustom()
  const { items } = orderForm

  const { loading } = useQuery(GET_PRODUCTS, {
    skip: !items?.length,
    variables: { values: items.map((orderItem) => orderItem.productId) },
    onCompleted: (data) => {
      data.productsByIdentifier.forEach(
        (product: {
          properties?: Array<{ originalName: string; values: string[] }>
          productId?: string
        }) => {
          const minQuantityProp = product?.properties?.find(
            (prop: { originalName: string }) =>
              prop.originalName === 'minQuantity'
          )

          if (!minQuantityProp || minQuantityProp.values.length === 0) {
            return
          }

          const minQuantityValue = Number(minQuantityProp.values)

          setMinQuantity(Number(minQuantityValue))

          if (item.quantity < Number(minQuantityValue)) {
            showToast?.({
              message: formatMessage(messages.changeMinimumQuantity),
            })
            updateQuantity({
              id: item.id,
              seller: item.seller ?? '1',
              quantity: Number(minQuantityValue),
            })
          }
        }
      )
    },
  })

  useEffect(() => {
    if (item.quantity < minQuantity) {
      setNewQuantity(minQuantity)
    } else {
      setNewQuantity(item.quantity)
    }
  }, [item.quantity, minQuantity])

  if (loading) {
    return <Spinner />
  }

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
      onChange={({ value }: { value: number }) => {
        setNewQuantity(value)

        if (value > 0) {
          clearTimeout(timeout.current)

          timeout.current = window.setTimeout(() => {
            updateQuantity({
              id: item.id,
              seller: item.seller ?? '1',
              quantity: value,
            })
          }, DELAY)
        }
      }}
    />
  )
}

export const QuantitySelector = withToast(QuantitySelectorComponent)
