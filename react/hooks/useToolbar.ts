import { useIntl } from 'react-intl'
import { useRuntime } from 'vtex.render-runtime'

import type { WithToast } from '../typings'
import { messages } from '../utils'
import { useOrderFormCustom } from './useOrderFormCustom'
import { usePlaceOrder } from './usePlaceOrder'

export function useToolbar(showToast: WithToast['showToast']) {
  const { navigate } = useRuntime()
  const { formatMessage } = useIntl()
  const { placeOrder, orderGroup, isLoading, isSuccess } = usePlaceOrder(
    showToast
  )

  const { orderForm } = useOrderFormCustom()

  if (isSuccess) {
    navigate({ to: `/checkout/orderPlaced?og=${orderGroup}` })
  }

  if (!orderForm?.items?.length) return null

  return {
    inputSearch: {
      value: '',
      placeholder: formatMessage(messages.searchPlaceholder),
      // eslint-disable-next-line no-console
      onChange: console.log,
      // eslint-disable-next-line no-console
      onClear: console.log,
      // eslint-disable-next-line no-console
      onSubmit: console.log,
    },
    newLine: {
      disabled: false,
      isLoading,
      label: formatMessage(messages.placeOrder),
      handleCallback: placeOrder,
    },
  }
}
