import { useState } from 'react'
import { useIntl } from 'react-intl'
import type { Item } from 'vtex.checkout-graphql'

import { useOrderFormCustom, usePlaceOrder } from '.'
import { useCheckoutB2BContext } from '../CheckoutB2BContext'
import { messages } from '../utils'

export function useToolbar(searchStore: boolean) {
  const { formatMessage } = useIntl()
  const { orderForm } = useOrderFormCustom()
  const { pending } = useCheckoutB2BContext()
  const { placeOrder, isLoading, isSuccess } = usePlaceOrder()

  const [searchTerm, setSearchTerm] = useState<string>('')

  // eslint-disable-next-line no-console
  console.log('searchStore', searchStore)

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
