import React, { useCallback, useEffect, useRef } from 'react'
import { useMutation } from 'react-apollo'
import { useIntl } from 'react-intl'
import {
  ClearOrderFormMessagesMutation,
  ClearOrderFormMessagesMutationVariables,
  MutationClearOrderFormMessages,
} from 'vtex.checkout-resources'
import { NumericStepper } from 'vtex.styleguide'

import { useCheckoutB2BContext } from '../../CheckoutB2BContext'
import {
  useOrderFormCustom,
  useToast,
  useUpdateItemsQuantity,
} from '../../hooks'
import { CustomItem } from '../../typings'
import { isItemUnavailable, messages } from '../../utils'

const DELAY = 500

type Props = { item: CustomItem; disabled?: boolean; minQuantity?: number }

type OrderFormMessage = {
  code: string
  text: string
}

export function QuantitySelector({ item, disabled, minQuantity = 1 }: Props) {
  const showToast = useToast()
  const { formatMessage } = useIntl()
  const timeout = useRef<number>()
  const { setPending } = useCheckoutB2BContext()
  const [newQuantity, setNewQuantity] = React.useState(item.quantity)
  const handleFinish = useCallback(() => setPending(false), [setPending])
  const { orderForm } = useOrderFormCustom()
  const ref = useRef<HTMLDivElement>(null)
  const getInput = () => ref.current?.querySelector('input')

  const [clearOrderFormMessages] = useMutation<
    ClearOrderFormMessagesMutation,
    ClearOrderFormMessagesMutationVariables
  >(MutationClearOrderFormMessages)

  const [updateQuantity] = useUpdateItemsQuantity({
    onCompleted(data) {
      const orderFormMessages = data?.updateItemsQuantity.messages.filter(
        ({ code }: OrderFormMessage) =>
          ['itemQuantityNotAvailable', 'itemMaxQuantityLimitReached'].includes(
            code
          )
      )

      if (orderFormMessages?.length) {
        orderFormMessages.forEach(({ code, text }: OrderFormMessage) => {
          const message =
            code === 'itemQuantityNotAvailable'
              ? `${text}: ${newQuantity}`
              : text

          showToast({ message })
        })

        clearOrderFormMessages({ variables: { orderFormId: orderForm.id } })
      }

      const newQuantityResponse =
        data?.updateItemsQuantity.items[item.itemIndex]?.quantity ?? 0

      if (!newQuantityResponse) return

      setNewQuantity(newQuantityResponse)
      const input = getInput()

      if (!input || newQuantityResponse === newQuantity) return

      input.blur()
      input.value = newQuantityResponse
      input.focus()
    },
  })

  const handleQuantityChange = useCallback(
    ({ value }: { value: number }) => {
      setNewQuantity(value)

      if (!value) return

      setPending(true)
      clearTimeout(timeout.current)

      timeout.current = window.setTimeout(() => {
        updateQuantity({
          variables: {
            orderItems: [{ index: item.itemIndex, quantity: value }],
          },
        }).finally(handleFinish)
      }, DELAY)
    },
    [handleFinish, item.itemIndex, setPending, updateQuantity]
  )

  useEffect(() => {
    if (item.quantity >= minQuantity || newQuantity >= minQuantity) return

    setNewQuantity(minQuantity)

    showToast({
      message: `${formatMessage(messages.changeMinimumQuantity)} ${
        item.skuName
      }`,
    })

    updateQuantity({
      variables: {
        orderItems: [{ index: item.itemIndex, quantity: minQuantity }],
      },
    })
  }, [
    formatMessage,
    item.itemIndex,
    item.quantity,
    item.skuName,
    minQuantity,
    newQuantity,
    showToast,
    updateQuantity,
  ])

  useEffect(() => {
    const input = getInput()

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
        maxValue={999999999}
        onChange={handleQuantityChange}
        readOnly={disabled}
      />
    </div>
  )
}
