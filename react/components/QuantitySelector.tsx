import React, { useEffect, useRef } from 'react'
import { useQuery } from 'react-apollo'
import { useIntl } from 'react-intl'
import { Item } from 'vtex.checkout-graphql'
import { OrderItems } from 'vtex.order-items'
import { NumericStepper } from 'vtex.styleguide'

import GET_PRODUCTS from '../graphql/productQuery.graphql'
import { useOrderFormCustom } from '../hooks/useOrderFormCustom'
import { isWithoutStock, messages } from '../utils'

const { useOrderItems } = OrderItems
const DELAY = 500

type Props = { item: Item }

export function QuantitySelector({ item }: Props) {
  const { formatMessage } = useIntl()
  const [newQuantity, setNewQuantity] = React.useState(item.quantity)
  const [minQuantity, setMinQuantity] = React.useState<number>(1)
  const timeout = useRef<number>()
  const { updateQuantity } = useOrderItems()

  // eslint-disable-next-line no-console
  console.log('minQuantity', minQuantity)

  const { orderForm } = useOrderFormCustom()

  const { items } = orderForm

  useQuery(GET_PRODUCTS, {
    skip: !items?.length,
    variables: { values: items.map(() => item.productId) },
    onCompleted: (data) => {
      // eslint-disable-next-line no-console
      console.log('TESTE:', data?.productsByIdentifier)
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

          const [minQuantityValue] = minQuantityProp.values

          setMinQuantity(Number(minQuantityValue))

          if (item.quantity < Number(minQuantityValue)) {
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

  /*
    TODO: este useEffect é necessário para que o valor do input seja
    atualizado quando o estoque ou a quantidade máxima permitida pela
    loja para um item é ultrapassada ao alterar a quantidade. Nesta
    situação, o orderForm é atualizado para reduzir a quantidade ao
    máximo permitido, renderizando novamente o componente. Poderia ser
    retirado se a informação de quantidada máxima fosse recuperada e
    utilizada na prop maxValue do NumericStepper, mas seria necessário
    fazer um novo request.
  */
  useEffect(() => {
    if (item.quantity < minQuantity) {
      setNewQuantity(minQuantity)
    } else {
      setNewQuantity(item.quantity)
    }
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
