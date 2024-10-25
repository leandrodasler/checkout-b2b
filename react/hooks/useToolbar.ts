import { useIntl } from 'react-intl'

import type { WithToast } from '../typings'
import { messages } from '../utils'
import { useOrderFormCustom } from './useOrderFormCustom'
import { usePlaceOrder } from './usePlaceOrder'

export function useToolbar(showToast: WithToast['showToast']) {
  const { formatMessage } = useIntl()
  const { placeOrder, isLoading, isSuccess } = usePlaceOrder(showToast)
  const { orderForm } = useOrderFormCustom()

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
      disabled: isLoading || isSuccess,
      isLoading,
      label: formatMessage(messages.placeOrder),
      handleCallback: placeOrder,
    },
  }
}
