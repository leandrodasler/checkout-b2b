import { useState } from 'react'
import { useIntl } from 'react-intl'
import { Item } from 'vtex.checkout-graphql'

import { usePlaceOrder } from './usePlaceOrder'
import { useOrderFormCustom } from './useOrderFormCustom'
import { messages } from '../utils'
import type { WithToast } from '../typings'

export function useToolbar(showToast: WithToast['showToast']) {
  const { formatMessage } = useIntl()
  const { orderForm } = useOrderFormCustom()
  const { placeOrder, isLoading, isSuccess } = usePlaceOrder(showToast)

  const [searchTerm, setSearchTerm] = useState<string>('')

  if (!orderForm?.items?.length) return null

  const handleFilterItems = (items: Item[]) => {
    return items.filter(
      (item) =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.skuName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.refId?.toLowerCase().includes(searchTerm.toLowerCase())
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
      disabled: isLoading || isSuccess,
      isLoading,
      label: formatMessage(messages.placeOrder),
      handleCallback: placeOrder,
    },
  }
}
