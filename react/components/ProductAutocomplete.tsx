import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useQuery } from 'react-apollo'
import { useIntl } from 'react-intl'
import { AutocompleteInput } from 'vtex.styleguide'

import SEARCH_PRODUCTSS from '../graphql/getProducts.graphql'
import { useAddItems } from '../hooks/useAddItems'
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

const ProductAutocomplete = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { formatMessage } = useIntl()

  const {
    data,
    error: queryError,
    loading: queryLoading,
  } = useQuery<ProductsResponse>(SEARCH_PRODUCTSS, {
    variables: { query: searchQuery },
    skip: !searchQuery,
  })

  const [
    addItemsMutation,
    { loading: mutationLoading, error: mutationError },
  ] = useAddItems()

  const handleSearchChange = useCallback((term: string) => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(() => {
      setSearchQuery(term)
    }, 1000)
  }, [])

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])
  const handleAddItem = (item: Item) => {
    if (!item?.sellers || item.sellers.length === 0) {
      console.error('Nenhum seller disponível para o item:', item)

      return
    }

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
  }

  const options = {
    onSelect: (option: { label: string; value: string; item: Item }) => {
      handleAddItem(option.item)
    },
    size: 'small',
    loading: queryLoading || mutationLoading,
    value:
      data?.products
        ?.map((product) =>
          product.items.map((item) => ({
            label: `${product.productName} - ${item.name}`,
            value: item.itemId,
            item,
          }))
        )
        .reduce((acc, curr) => [...acc, ...curr], []) ?? [],
  }

  const input = {
    onChange: handleSearchChange,

    onClear: () => setSearchQuery(''),
    placeholder: formatMessage(messages.searchProductsPlaceholder),
    value: searchQuery,
  }

  if (queryError) {
    console.error('Erro na query:', queryError)

    return <div>{formatMessage(messages.searchProductsError)}</div>
  }

  if (mutationError) {
    console.error('Erro na mutation:', mutationError)
  }

  return <AutocompleteInput input={input} options={options} />
}

export default ProductAutocomplete
