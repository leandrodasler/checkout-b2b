import React, {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useQuery } from 'react-apollo'
import { useIntl } from 'react-intl'
import { OrderItems } from 'vtex.order-items'
import {
  AutocompleteInput,
  ButtonWithIcon,
  IconDelete,
  Spinner,
  Tooltip,
} from 'vtex.styleguide'

import { useCheckoutB2BContext } from '../CheckoutB2BContext'
import SEARCH_PRODUCTSS from '../graphql/getProducts.graphql'
import { useDebounce, useOrderFormCustom, useToast } from '../hooks'
import { useAddItems } from '../hooks/useAddItems'
import {
  ERROR_TO_RETRY_PATTERNS,
  removeAccents,
  SEARCH_TYPE,
  transformImageUrl,
} from '../utils'
import { messages } from '../utils/messages'

const { useOrderItems } = OrderItems

interface CommertialOffer {
  Price: number
}

interface Seller {
  sellerId: string
  commertialOffer: CommertialOffer
}

interface Item {
  itemId: string
  name: string
  sellers: Seller[]
  images: Array<{ imageUrl: string }>
}

interface Product {
  productId: string
  productName: string
  items: Item[]
}

interface ProductsResponse {
  products: Product[]
}

type ProductValue = {
  type: 'product'
  item: Product['items']
}

type SkuValue = {
  type: 'sku'
  item: Item
}

type CustomOptionValue = { label: string } & (ProductValue | SkuValue)

type CustomOptionProps = {
  searchTerm: string
  value: CustomOptionValue
  selected: boolean
  inserted: boolean
  loading: boolean
  handleAddItem: (item: CustomOptionValue['item']) => void
  setItemsQueue: React.Dispatch<React.SetStateAction<Item[]>>
}

type AddToCartFn = (newItems: Item[], retryCount?: number) => void

const MAX_ADD_TO_CART_RETRIES = 5
const SEARCH_TIMEOUT = 1000
const ADD_TO_CART_TIMEOUT = 2000
const RETRY_ADD_TO_CART_TIMEOUT = 500

function sortSellersByPrice(s1: Seller, s2: Seller) {
  return s1.commertialOffer.Price - s2.commertialOffer.Price
}

function shouldRetryOnError(error: Error) {
  return ERROR_TO_RETRY_PATTERNS.some((pattern) =>
    error.message.toLowerCase().includes(pattern)
  )
}

const ProductAutocomplete = () => {
  const showToast = useToast()
  const { formatMessage } = useIntl()
  const { searchStore, searchQuery, setSearchQuery } = useCheckoutB2BContext()
  const setSearchQueryDebounced = useDebounce(setSearchQuery, SEARCH_TIMEOUT)
  const { orderForm } = useOrderFormCustom()
  const [itemsQueue, setItemsQueue] = useState<Item[]>([])

  const orderFormHasItem = useCallback(
    (item: Item) => orderForm.items.some((i) => i.id === item.itemId),
    [orderForm.items]
  )

  const {
    data,
    error: queryError,
    loading: queryLoading,
    networkStatus,
  } = useQuery<ProductsResponse>(SEARCH_PRODUCTSS, {
    variables: { query: searchQuery },
    skip: !searchStore || !searchQuery,
  })

  const [addItemsMutation, { error: mutationError }] = useAddItems({
    toastError: false,
  })

  const handleSearchChange = useCallback(
    (term: string) => {
      setSearchQueryDebounced(term)
    },
    [setSearchQueryDebounced]
  )

  const itemsOptions = React.useMemo(() => {
    if (!data?.products) return []

    const options: Array<CustomOptionValue & { value: string }> = []

    data.products.forEach((product) => {
      options.push({
        label: `${product.productName} `,
        value: `product-${product.productId}`,
        item: product.items,
        type: 'product',
      })

      product.items.forEach((item) => {
        options.push({
          label: `${item.name}`,
          value: item.itemId,
          item,
          type: 'sku',
        })
      })
    })

    return options
  }, [data?.products])

  const rootRef = useRef<HTMLDivElement>(null)
  const setInputFocus = () => rootRef.current?.querySelector('input')?.focus()

  const addToCart: AddToCartFn = useCallback(
    (newItems, retryCount = 0) => {
      addItemsMutation({
        variables: {
          items: newItems.map((item) => ({
            id: Number(item.itemId),
            quantity: 1,
            seller: item.sellers.sort(sortSellersByPrice)[0].sellerId,
          })),
        },
      })
        .then((result) => {
          if (!result) return

          const retryError = result.errors?.find(shouldRetryOnError)

          if (retryError) {
            throw retryError
          }

          setItemsQueue([]) // Reset the queue after successfully adding to the cart
        })
        .catch((e) => {
          if (retryCount < MAX_ADD_TO_CART_RETRIES && shouldRetryOnError(e)) {
            window.setTimeout(
              () => addToCart(newItems, retryCount + 1),
              RETRY_ADD_TO_CART_TIMEOUT
            )

            return
          }

          setItemsQueue([]) // Reset the queue after error
          showToast({ message: e.message })
        })
    },
    [addItemsMutation, showToast]
  )

  const addToCartDebounced = useDebounce(addToCart, ADD_TO_CART_TIMEOUT)

  const handleAddItem: CustomOptionProps['handleAddItem'] = useCallback(
    (item) => {
      setInputFocus()

      const items = Array.isArray(item) ? item : [item]
      const validItems = items.filter((i) => i?.sellers && i.sellers.length > 0)

      if (validItems.length === 0) {
        console.error('Nenhum seller disponível para os itens:', items)

        return
      }

      const newItems = [
        ...itemsQueue,
        ...validItems.filter(
          (i) => !itemsQueue.some((prevItem) => prevItem.itemId === i.itemId)
        ),
      ]

      setItemsQueue(newItems)
      addToCartDebounced(newItems)
    },
    [addToCartDebounced, itemsQueue]
  )

  const isEmpty = networkStatus === 7 && !itemsOptions.length

  const options = {
    onSelect: () => {},
    size: 'small',
    loading: queryLoading,
    maxHeight: 400,
    renderOption: function RenderOption(props: CustomOptionProps) {
      if (!props.value) return null

      const inserted =
        props.value.type === 'product'
          ? props.value.item.every(orderFormHasItem)
          : orderFormHasItem(props.value.item)

      const loading =
        props.value.type === 'product'
          ? props.value.item
              .filter((item) => !orderFormHasItem(item))
              .every((i) =>
                itemsQueue.some((itemQueue) => i.itemId === itemQueue.itemId)
              )
          : itemsQueue.some(
              (itemQueue) =>
                props.value.type === 'sku' &&
                props.value.item.itemId === itemQueue.itemId
            )

      return (
        <CustomOption
          {...props}
          inserted={inserted}
          handleAddItem={handleAddItem}
          loading={loading}
          setItemsQueue={setItemsQueue}
        />
      )
    },
    value: itemsOptions,
    ...(isEmpty && {
      customMessage: formatMessage(messages.searchProductsEmpty, {
        term: searchQuery,
        type: SEARCH_TYPE.STORE,
      }),
    }),
  }

  const input = {
    onChange: handleSearchChange,
    onClear: () => setSearchQuery(''),
    placeholder: formatMessage(messages.searchProductsPlaceholder),
    value: searchQuery,
    className: 't-body w-100 ph5 b--none outline-0',
  }

  if (queryError) {
    console.error('Erro na query:', queryError)
  }

  if (mutationError) {
    console.error('Erro na mutation:', mutationError)
  }

  useEffect(() => {
    if (searchStore) {
      setInputFocus()
    }
  }, [searchStore])

  if (!searchStore) return null

  return (
    <div ref={rootRef}>
      <AutocompleteInput input={input} options={options} />
    </div>
  )
}

function CustomOption(props: CustomOptionProps) {
  const { formatMessage } = useIntl()
  const { removeItem } = useOrderItems()
  const {
    searchTerm,
    value,
    selected,
    inserted,
    handleAddItem,
    loading,
    setItemsQueue,
  } = props

  const [highlightOption, setHighlightOption] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const searchWords = searchTerm.trim().split(/\s+/).filter(Boolean)
  const labelSplitted = value.label.split(/\s+/)
  const highlightedLabel = labelSplitted.map((part, index) => (
    <Fragment key={index}>
      {searchWords.some(
        (word) => removeAccents(word) === removeAccents(part)
      ) ? (
        <span className="fw7">{part}</span>
      ) : (
        part
      )}
      {index < labelSplitted.length - 1 && ' '}
    </Fragment>
  ))

  const buttonClasses = `bn w-100 tl pointer pa4 f6 outline-0 ${
    selected || (highlightOption && !inserted)
      ? 'bg-muted-4'
      : value.type === 'product'
      ? 'bg-muted-5'
      : 'bg-base'
  }${inserted ? ' strike' : ''}`

  useEffect(() => {
    if (selected) {
      wrapperRef.current?.focus()
    }
  }, [selected])

  const removeItems = useCallback(
    (itemsToRemove: Item[]) => {
      itemsToRemove.forEach((item) => {
        const sellerId = item.sellers[0]?.sellerId

        if (!sellerId) {
          console.error(`No seller found for item ${item.itemId}`)

          return
        }

        try {
          removeItem({
            id: item.itemId,
            seller: sellerId,
          })
        } catch (error) {
          console.error(`Failed to remove item ${item.itemId}:`, error)
        }
      })

      setItemsQueue((prevQueue) =>
        prevQueue.filter(
          (queueItem) =>
            !itemsToRemove.some(
              (removedItem) => removedItem.itemId === queueItem.itemId
            )
        )
      )
    },
    [removeItem, setItemsQueue]
  )

  const debouncedRemoveItems = useDebounce(removeItems, 500)

  const handleRemoveItem = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()

      const itemsToRemove = value.type === 'product' ? value.item : [value.item]

      debouncedRemoveItems(itemsToRemove)
    },
    [debouncedRemoveItems, value]
  )

  const mainElement = (
    <div
      ref={wrapperRef}
      className={buttonClasses}
      role="button"
      tabIndex={0}
      aria-label={
        value.type === 'product'
          ? formatMessage(messages.searchProductsAddAll)
          : 'add'
      }
      onFocus={() => setHighlightOption(true)}
      onBlur={() => setHighlightOption(false)}
      onMouseEnter={() => setHighlightOption(true)}
      onMouseLeave={() => setHighlightOption(false)}
      onClick={(e) => {
        if (inserted || loading) return
        handleAddItem(value.item)
        e.currentTarget.focus()
      }}
      onKeyDown={(e) => {
        if (inserted || loading) return
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleAddItem(value.item)
        }
      }}
    >
      <div className="flex flex-wrap items-center justify-between">
        <span className="truncate">
          {value.type === 'sku' && (
            <img
              width="30"
              src={transformImageUrl(value.item.images[0].imageUrl, 30)}
              alt={value.item.name}
              className="mr2 v-mid"
            />
          )}
          {highlightedLabel}
        </span>
        <div className="flex items-center">
          {loading && !inserted && <Spinner size={16} />}
          {inserted && (
            <ButtonWithIcon
              size="small"
              icon={<IconDelete />}
              variation="danger-tertiary"
              onClick={handleRemoveItem}
              onKeyDown={(e: {
                key: string
                preventDefault: () => void
                stopPropagation: () => void
              }) => {
                if (e.key !== 'Enter' && e.key !== ' ') return
                e.preventDefault()
                e.stopPropagation()
                handleRemoveItem(e as never)
              }}
              aria-label={formatMessage(messages.removeItem)}
            />
          )}
        </div>
      </div>
    </div>
  )

  if (value.type === 'product' && !inserted) {
    return (
      <Tooltip label={formatMessage(messages.searchProductsAddAll)}>
        {mainElement}
      </Tooltip>
    )
  }

  return mainElement
}

export default ProductAutocomplete
