import { useState } from 'react'
import { useIntl } from 'react-intl'
import { Item } from 'vtex.checkout-graphql'

import { useCheckoutB2BContext } from '../CheckoutB2BContext'
import type { WithToast } from '../typings'
import { messages } from '../utils'
import { useOrderFormCustom } from './useOrderFormCustom'
import { usePlaceOrder } from './usePlaceOrder'

export function useToolbar(showToast: WithToast['showToast']) {
  const { formatMessage } = useIntl()
  const { orderForm } = useOrderFormCustom()
  const { pending } = useCheckoutB2BContext()
  const { placeOrder, isLoading, isSuccess } = usePlaceOrder(showToast)

  const [searchTerm, setSearchTerm] = useState<string>('')

  if (!orderForm?.items?.length) return null

  const handleFilterItems = (items: Item[]) => {
    return items.filter(
      ({ name, skuName, refId }) =>
        (name?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
        (skuName?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
        (refId?.toLowerCase() ?? '').includes(searchTerm.toLowerCase())
    )
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  const handleClearSearch = () => {
    setSearchTerm('')
  }

  const handleSubmit = () => {
    handleFilterItems(orderForm.items)
  }

  const filteredItems = handleFilterItems(orderForm.items)

  return {
    filteredItems,
    inputSearch: {
      value: searchTerm,
      placeholder: formatMessage(messages.searchPlaceholder),
      onChange: handleSearchChange,
      onClear: handleClearSearch,
      onSubmit: handleSubmit,
    },
    newLine: {
      disabled: isLoading || isSuccess || pending,
      isLoading,
      label: formatMessage(messages.placeOrder),
      handleCallback: placeOrder,
    },
  }
}
