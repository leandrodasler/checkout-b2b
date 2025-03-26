import { useIntl } from 'react-intl'
import type { Item } from 'vtex.checkout-graphql'

import { useOrderFormCustom, usePlaceOrder } from '.'
import { useCheckoutB2BContext } from '../CheckoutB2BContext'
import { messages } from '../utils'

export function useToolbar() {
  const { formatMessage } = useIntl()
  const { orderForm } = useOrderFormCustom()
  const { pending, searchQuery, setSearchQuery } = useCheckoutB2BContext()
  const { placeOrder, isLoading, isSuccess } = usePlaceOrder()

  if (!orderForm?.items?.length) return null

  const handleFilterItems = (items: Item[]) => {
    return items.filter(
      ({ name, skuName, refId }) =>
        (name?.toLowerCase() ?? '').includes(searchQuery.toLowerCase()) ||
        (skuName?.toLowerCase() ?? '').includes(searchQuery.toLowerCase()) ||
        (refId?.toLowerCase() ?? '').includes(searchQuery.toLowerCase())
    )
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value)
  }

  const handleClearSearch = () => {
    setSearchQuery('')
  }

  const handleSubmit = () => {
    handleFilterItems(orderForm.items)
  }

  const filteredItems = handleFilterItems(orderForm.items)

  return {
    filteredItems,
    inputSearch: {
      value: searchQuery,
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
