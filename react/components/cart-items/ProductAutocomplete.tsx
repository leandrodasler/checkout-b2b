import React, {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useQuery } from 'react-apollo'
import { useIntl } from 'react-intl'
import { MutationUpdateItemsQuantityArgs } from 'ssesandbox04.checkout-b2b'
import { FormattedPrice } from 'vtex.formatted-price'
import {
  AutocompleteInput,
  ButtonWithIcon,
  IconDelete,
  Spinner,
  Tooltip,
} from 'vtex.styleguide'

import { useCheckoutB2BContext } from '../../CheckoutB2BContext'
import SEARCH_PRODUCTSS from '../../graphql/getProducts.graphql'
import {
  useDebounce,
  useOrderFormCustom,
  useToast,
  useUpdateItemsQuantity,
} from '../../hooks'
import { useAddItems } from '../../hooks/useAddItems'
import {
  ERROR_TO_RETRY_PATTERNS,
  removeAccents,
  SEARCH_TYPE,
  transformImageUrl,
} from '../../utils'
import { messages } from '../../utils/messages'

interface CommertialOffer {
  Price: number
}

interface Seller {
  sellerDefault: boolean
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
  onChangeItems: () => void
}

type AddToCartFn = (newItems: Item[], retryCount?: number) => void

const MAX_ADD_TO_CART_RETRIES = 5
const SEARCH_TIMEOUT = 1000
const ADD_TO_CART_TIMEOUT = 1500
const RETRY_ADD_TO_CART_TIMEOUT = 500

function sortSellersByPrice(s1: Seller, s2: Seller) {
  return s1.commertialOffer.Price - s2.commertialOffer.Price
}

function shouldRetryOnError(error: Error) {
  return ERROR_TO_RETRY_PATTERNS.some((pattern) =>
    error.message.toLowerCase().includes(pattern)
  )
}

type Props = {
  onChangeItems: () => void
}

const ProductAutocomplete = ({ onChangeItems }: Props) => {
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
    loading: queryLoading,
    networkStatus,
  } = useQuery<ProductsResponse>(SEARCH_PRODUCTSS, {
    variables: { query: searchQuery },
    onError: showToast,
    skip: !searchStore || !searchQuery,
  })

  const [addItemsMutation, { error: mutationError }] = useAddItems()

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

      if (product.items.length > 1) {
        product.items.forEach((item) => {
          options.push({
            label: `${item.name}`,
            value: item.itemId,
            item,
            type: 'sku',
          })
        })
      }
    })

    return options
  }, [data?.products])

  const rootRef = useRef<HTMLDivElement>(null)
  const setInputFocus = () => rootRef.current?.querySelector('input')?.focus()

  const addToCart: AddToCartFn = useCallback(
    (newItems, retryCount = 0) => {
      addItemsMutation({
        variables: {
          orderItems: newItems.map((item) => ({
            id: Number(item.itemId),
            quantity: 1,
            seller:
              item.sellers.find((s) => s.sellerDefault)?.sellerId ??
              item.sellers.sort(sortSellersByPrice)[0].sellerId,
          })),
        },
      })
        .then((result) => {
          setItemsQueue([])
          const retryError = result?.errors?.find(shouldRetryOnError)

          if (retryError) {
            throw retryError
          }
        })
        .catch((e) => {
          if (retryCount < MAX_ADD_TO_CART_RETRIES && shouldRetryOnError(e)) {
            window.setTimeout(
              () => addToCart(newItems, retryCount + 1),
              RETRY_ADD_TO_CART_TIMEOUT
            )

            return
          }

          setItemsQueue([])
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

      if (validItems.length === 0) return

      onChangeItems()

      const newItems = [
        ...itemsQueue,
        ...validItems.filter(
          (i) => !itemsQueue.some((prevItem) => prevItem.itemId === i.itemId)
        ),
      ]

      setItemsQueue(newItems)
      addToCartDebounced(newItems)
    },
    [addToCartDebounced, itemsQueue, onChangeItems]
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

      const productItemsOutOfOrderForm =
        props.value.type === 'product'
          ? props.value.item.filter((item) => !orderFormHasItem(item))
          : []

      const loading =
        !mutationError &&
        (props.value.type === 'product'
          ? !!productItemsOutOfOrderForm.length &&
            productItemsOutOfOrderForm.every((i) =>
              itemsQueue.some((itemQueue) => i.itemId === itemQueue.itemId)
            )
          : itemsQueue.some(
              (itemQueue) =>
                props.value.type === 'sku' &&
                props.value.item.itemId === itemQueue.itemId
            ))

      return (
        <CustomOption
          {...props}
          inserted={inserted}
          handleAddItem={handleAddItem}
          onChangeItems={onChangeItems}
          loading={loading}
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
  const { orderForm } = useOrderFormCustom()
  const { formatMessage } = useIntl()
  const [updateQuantity, { loading: removeLoading }] = useUpdateItemsQuantity()
  const {
    searchTerm,
    value,
    selected,
    inserted,
    handleAddItem,
    onChangeItems,
    loading,
  } = props

  const [highlightOption, setHighlightOption] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const searchWords = searchTerm.trim().split(/\s+/).filter(Boolean)
  const labelSplitted = value.label.split(/\s+/)
  const mainItem =
    value.type === 'product'
      ? value.item.length === 1
        ? value.item[0]
        : null
      : value.item

  const itemPrice = mainItem && (
    <FormattedPrice
      value={mainItem.sellers.sort(sortSellersByPrice)[0].commertialOffer.Price}
    />
  )

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
      : value.type === 'product' && !loading
      ? 'bg-muted-5'
      : loading || removeLoading
      ? 'bg-washed-blue'
      : 'bg-base'
  }${inserted ? ' strike' : ''}`

  useEffect(() => {
    if (selected) {
      wrapperRef.current?.focus()
    }
  }, [selected])

  const handleRemoveItem = useCallback(
    (e: React.MouseEvent | React.KeyboardEvent) => {
      e.stopPropagation()
      e.preventDefault()

      onChangeItems()
      const itemsToRemove = value.type === 'product' ? value.item : [value.item]

      updateQuantity({
        variables: {
          orderItems: itemsToRemove.reduce<
            MutationUpdateItemsQuantityArgs['orderItems']
          >((acc, item) => {
            const orderItems = orderForm.items
              .filter((i) => i.id === item.itemId)
              .map(({ itemIndex }) => ({ index: itemIndex, quantity: 0 }))

            return [...acc, ...orderItems]
          }, []),
        },
      })
    },
    [onChangeItems, orderForm.items, updateQuantity, value.item, value.type]
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
        if (inserted || loading || removeLoading) return
        handleAddItem(value.item)
        e.currentTarget.focus()
      }}
      onKeyDown={(e) => {
        if (inserted || loading || removeLoading) return
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleAddItem(value.item)
        }
      }}
    >
      <div className="flex items-center justify-between">
        <span className="truncate">
          {mainItem && (
            <img
              width="30"
              src={transformImageUrl(mainItem.images[0].imageUrl, 30)}
              alt={mainItem.name}
              className="mr2 v-mid"
            />
          )}
          {highlightedLabel}
        </span>
        <div className="flex items-center">
          {itemPrice}
          {loading && !inserted && (
            <div className="ml2">
              <Spinner size={16} />
            </div>
          )}
          {inserted && (
            <div className="ml2">
              <ButtonWithIcon
                isLoading={removeLoading}
                size="small"
                icon={<IconDelete />}
                variation="danger-tertiary"
                onClick={handleRemoveItem}
                onKeyDown={(e: React.KeyboardEvent) => {
                  if (e.key !== 'Enter' && e.key !== ' ') return
                  e.preventDefault()
                  e.stopPropagation()
                  handleRemoveItem(e)
                }}
                aria-label={formatMessage(messages.removeItem)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )

  if (
    value.type === 'product' &&
    value.item.length > 1 &&
    !inserted &&
    !loading
  ) {
    return (
      <Tooltip label={formatMessage(messages.searchProductsAddAll)}>
        {mainElement}
      </Tooltip>
    )
  }

  return mainElement
}

export default ProductAutocomplete
