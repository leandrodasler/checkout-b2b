import { useIntl } from 'react-intl'

import { messages } from '../utils'
import { useOrderFormCustom } from './useOrderFormCustom'

export function useToolbar() {
  const { formatMessage } = useIntl()
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
      disabled: false,
      isLoading: false,
      label: formatMessage(messages.placeOrder),
      // eslint-disable-next-line no-console
      handleCallback: () => console.log(formatMessage(messages.placeOrder)),
    },
  }
}
