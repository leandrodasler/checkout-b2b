import React, { useEffect, useRef } from 'react'
import { useIntl } from 'react-intl'
import { Item } from 'vtex.checkout-graphql'
import { OrderItems } from 'vtex.order-items'
import { NumericStepper } from 'vtex.styleguide'

import { isWithoutStock, messages } from '../utils'

const { useOrderItems } = OrderItems
const DELAY = 500

type Props = { item: Item }

export function QuantitySelector({ item }: Props) {
  const { formatMessage } = useIntl()
  const [newQuantity, setNewQuantity] = React.useState(item.quantity)
  const timeout = useRef<number>()
  const { updateQuantity } = useOrderItems()

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
    setNewQuantity(item.quantity)
  }, [item.quantity])

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
      minValue={1}
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
