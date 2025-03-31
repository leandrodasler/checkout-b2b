import React, {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useQuery } from 'react-apollo'
import { useIntl } from 'react-intl'
import { AutocompleteInput, Spinner } from 'vtex.styleguide'

import { useCheckoutB2BContext } from '../CheckoutB2BContext'
import SEARCH_PRODUCTSS from '../graphql/getProducts.graphql'
import { useDebounce, useOrderFormCustom } from '../hooks'
import { useAddItems } from '../hooks/useAddItems'
import { removeAccents } from '../utils'
import { messages } from '../utils/messages'

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
}

interface Product {
  productId: string
  productName: string
  items: Item[]
}

interface ProductsResponse {
  products: Product[]
}

type CustomOptionProps = {
  searchTerm: string
  value: { label: string; item: Item }
  selected: boolean
  inserted: boolean
  handleAddItem: (item: Item) => void
}

const ProductAutocomplete = () => {
  const { formatMessage } = useIntl()
  const { searchQuery, setSearchQuery } = useCheckoutB2BContext()
  const setSearchQueryDebounced = useDebounce(setSearchQuery, 1000)
  const { orderForm } = useOrderFormCustom()

  const orderFormHasItem = useCallback(
    (item: Item) =>
      orderForm.items.some(
        (i) => i.id === item.itemId && i.seller === item.sellers[0].sellerId
      ),
    [orderForm.items]
  )

  const {
    data,
    error: queryError,
    loading: queryLoading,
    networkStatus,
  } = useQuery<ProductsResponse>(SEARCH_PRODUCTSS, {
    variables: { query: searchQuery },
    skip: !searchQuery,
  })

  const [addItemsMutation, { error: mutationError }] = useAddItems()

  const handleSearchChange = useCallback(
    (term: string) => {
      setSearchQueryDebounced(term)
    },
    [setSearchQueryDebounced]
  )

  const itemsOptions =
    data?.products
      ?.map((product) =>
        product.items.map((item) => ({
          label: `${product.productName} - ${item.name}`,
          value: item.itemId,
          item,
        }))
      )
      .reduce((acc, curr) => [...acc, ...curr], []) ?? []

  const rootRef = useRef<HTMLDivElement>(null)

  const handleAddItem = useCallback(
    (item: Item) => {
      if (!item?.sellers || item.sellers.length === 0) {
        console.error('Nenhum seller disponível para o item:', item)

        return
      }

      rootRef.current?.querySelector('input')?.focus()

      addItemsMutation({
        variables: {
          items: [
            {
              id: Number(item.itemId),
              quantity: 1,
              seller: item.sellers[0].sellerId,
            },
          ],
        },
      })
    },
    [addItemsMutation, rootRef]
  )

  const isEmpty = networkStatus === 7 && !itemsOptions.length

  const options = {
    onSelect: () => {},
    size: 'small',
    loading: queryLoading,
    maxHeight: 400,
    renderOption: function RenderOption(props: CustomOptionProps) {
      if (!props.value) return null

      return (
        <CustomOption
          {...props}
          {...(props.value.item &&
            orderFormHasItem(props.value.item) && { inserted: true })}
          handleAddItem={handleAddItem}
        />
      )
    },
    value: itemsOptions,
    ...(isEmpty && {
      customMessage: formatMessage(messages.searchProductsEmpty, {
        term: searchQuery,
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

  return (
    <div ref={rootRef}>
      <AutocompleteInput input={input} options={options} />
    </div>
  )
}

function CustomOption(props: CustomOptionProps) {
  const { searchTerm, value, selected, inserted, handleAddItem } = props
  const [highlightOption, setHighlightOption] = useState(false)
  const [loading, setLoading] = useState(false)
  const wrapperRef = useRef<HTMLButtonElement>(null)
  const { label } = value
  const searchWords = searchTerm.trim().split(/\s+/).filter(Boolean)
  const labelSplitted = label.split(/\s+/)
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
    selected || (highlightOption && !inserted) ? 'bg-muted-5' : 'bg-base'
  }${inserted ? ' strike' : ''}`

  useEffect(() => {
    if (selected) {
      wrapperRef.current?.focus()
    }
  }, [selected])

  return (
    <button
      ref={wrapperRef}
      className={buttonClasses}
      onFocus={() => setHighlightOption(true)}
      onBlur={() => setHighlightOption(false)}
      onMouseEnter={() => setHighlightOption(true)}
      onMouseLeave={() => setHighlightOption(false)}
      onClick={() => {
        if (inserted || loading) return

        setLoading(true)
        handleAddItem(value.item)
      }}
    >
      <div className="flex flex-wrap items-center">
        <span className="truncate">{highlightedLabel}</span>
        {loading && !inserted && <Spinner size={16} />}
      </div>
    </button>
  )
}

export default ProductAutocomplete
