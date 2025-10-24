import { useIntl } from 'react-intl'

import { useOrderFormCustom, useOrganization, usePlaceOrder } from '.'
import { useCheckoutB2BContext } from '../CheckoutB2BContext'
import { CustomItem } from '../typings'
import { messages, removeAccents } from '../utils'

type Props = {
  onChangeItems: () => void
}

export function useToolbar({ onChangeItems }: Props) {
  const { formatMessage } = useIntl()
  const { loading: loadingOrganization } = useOrganization()
  const { orderForm, loading: loadingOrderForm } = useOrderFormCustom()
  const {
    pending,
    useCartLoading,
    searchQuery,
    setSearchQuery,
    selectedCart,
    loadingCurrentSavedCart,
  } = useCheckoutB2BContext()

  const { placeOrder, isLoading } = usePlaceOrder({ onChangeItems })

  if (loadingOrganization || loadingOrderForm) return null

  const handleFilterItems = (items: CustomItem[]) => {
    return searchQuery
      ? items.filter(({ name, skuName, refId }) =>
          removeAccents(searchQuery)
            .split(/\s+/)
            .filter(Boolean)
            .every(
              (word) =>
                removeAccents(name).includes(word) ||
                removeAccents(skuName).includes(word) ||
                removeAccents(refId).includes(word)
            )
        )
      : items
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

  const blockedCartStatus =
    selectedCart?.status === 'pending' || selectedCart?.status === 'denied'

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
      disabled:
        isLoading ||
        pending ||
        useCartLoading ||
        !orderForm.items.length ||
        blockedCartStatus ||
        loadingCurrentSavedCart,
      isLoading,
      label: formatMessage(messages.placeOrder),
      handleCallback: placeOrder,
    },
  }
}
