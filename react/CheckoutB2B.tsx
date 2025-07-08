import { QueryClientProvider } from '@tanstack/react-query'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useMutation } from 'react-apollo'
import { useIntl } from 'react-intl'
import { MutationSetManualPrice } from 'vtex.checkout-resources'
import 'vtex.country-codes/locales'
import { useCssHandles } from 'vtex.css-handles'
import { ExtensionPoint, useRuntime } from 'vtex.render-runtime'
import {
  Button,
  Layout,
  PageBlock,
  PageHeader,
  Slider,
  Table,
  ToastProvider,
  Toggle,
  Totalizer,
} from 'vtex.styleguide'
import { Item } from '@vtex/order-items/types/typings'

import {
  CheckoutB2BProvider,
  useCheckoutB2BContext,
} from './CheckoutB2BContext'
import { ContactInfos } from './components/ContactInfos'
import ProductAutocomplete from './components/ProductAutocomplete'
import { SavedCarts } from './components/SavedCarts'
import {
  useClearCart,
  useOrderFormCustom,
  useOrganization,
  usePermissions,
  useTableSchema,
  useToast,
  useToolbar,
  useTotalizers,
} from './hooks'
import { queryClient } from './services'
import './styles.css'
import { CompleteOrderForm } from './typings'
import { messages, SEARCH_TYPE, welcome } from './utils'

function CheckoutB2B() {
  const handles = useCssHandles(['container', 'table', 'containerToggle'])
  const { loading: organizationLoading } = useOrganization()
  const {
    loading: orderFormLoading,
    orderForm,
    setOrderForm,
  } = useOrderFormCustom()

  const { clearCart, isLoading: clearCartLoading } = useClearCart()
  const totalizers = useTotalizers()
  const {
    discountApplied = 0,
    setDiscountApplied,
    setMaximumDiscount,
    subtotal,
    listedPrice,
    percentualDiscount,
    setPercentualDiscount,
    searchQuery,
    searchStore,
    setSearchStore,
  } = useCheckoutB2BContext()

  const [expandedProducts, setExpandedProducts] = useState<string[]>([])

  const [isGrouping, setIsGrouping] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const toolbar = useToolbar()
  const { navigate } = useRuntime()
  const [prices, setPrices] = useState<Record<string, number>>({})
  const { formatMessage } = useIntl()
  const { items } = orderForm

  const loading = useMemo(() => orderFormLoading || organizationLoading, [
    orderFormLoading,
    organizationLoading,
  ])

  const showToast = useToast()

  const { maximumDiscount, isSalesUser } = usePermissions()

  useEffect(() => {
    if (listedPrice > 0) {
      const discountPercentage = ((listedPrice - subtotal) / listedPrice) * 100

      setPercentualDiscount(discountPercentage)
    }
  }, [listedPrice, subtotal, setPercentualDiscount])

  useEffect(() => {
    setMaximumDiscount(maximumDiscount)
  }, [maximumDiscount, setMaximumDiscount])

  const sliderMaxValue = useMemo(() => {
    return Math.min(maximumDiscount, maximumDiscount - percentualDiscount)
  }, [maximumDiscount, percentualDiscount])

  const filteredItems = useMemo(() => {
    const baseItems = searchStore ? items : toolbar?.filteredItems ?? items

    if (!isGrouping) return baseItems

    const seen = new Set<string>()
    const result: typeof items = []

    for (const item of baseItems) {
      const key = item.productId ?? ''

      if (!seen.has(key)) {
        result.push({
          __group: true,
          productId: key,
          name: item.name,
          id: `group-${key}`,
        } as typeof item & { tax: number; __group: boolean })

        seen.add(key)
      }

      if (expandedProducts.includes(key)) {
        result.push({
          ...item,
          tax: (item as Item & { tax?: number }).tax ?? undefined,
        })
      }
    }

    return result
  }, [searchStore, toolbar?.filteredItems, items, isGrouping, expandedProducts])

  const updatePrice = useCallback((id: string, newPrice: number) => {
    setPrices((prevPrices) => {
      const updatedPrices = {
        ...prevPrices,
        [id]: newPrice,
      }

      return updatedPrices
    })
  }, [])

  const schema = useTableSchema({
    expandedProducts,
    setExpandedProducts,
    isGrouping,
    isEditing,
    discount: discountApplied,
    onUpdatePrice: updatePrice,
  })

  const [setManualPrice, { loading: saving }] = useMutation(
    MutationSetManualPrice,
    {
      onCompleted: ({ updateOrderFormPayment }) => {
        setOrderForm({
          ...orderForm,
          ...updateOrderFormPayment,
        } as CompleteOrderForm)
      },
      onError: (error) => {
        console.error('Erro na mutação:', error)
        showToast?.({ message: error.message })
      },
    }
  )

  const getUpdatedPrices = useCallback(() => {
    return filteredItems.map((item, index) => ({
      orderFormId: orderForm.id,
      itemIndex: index,
      price: prices[item.id] ?? item.manualPrice ?? item.sellingPrice,
    }))
  }, [filteredItems, prices, orderForm.id])

  const handleSavePrices = async () => {
    if (percentualDiscount > maximumDiscount) {
      showToast?.({ message: 'Desconto acima do limite' })

      return
    }

    const updatedPrices = getUpdatedPrices()

    try {
      for await (const item of updatedPrices) {
        await setManualPrice({
          variables: {
            orderFormId: item.orderFormId,
            manualPriceInput: {
              itemIndex: item.itemIndex,
              price: Math.round(item.price),
            },
          },
        })
      }

      showToast?.({
        message: formatMessage(messages.manualPriceSuccess),
      })
    } catch (error) {
      console.error('Erro ao salvar os preços:', error)
      showToast?.({
        message: formatMessage(messages.manualPriceError),
      })
    }
  }

  const toggleEditMode = () => {
    setIsEditing((prev) => !prev)
  }

  const toggleRef = useRef<HTMLDivElement>(null)
  const tableRef = useRef<HTMLDivElement>(null)
  const autocompleteRef = useRef<HTMLInputElement>(null)

  const handleToggleSearchStore = useCallback(
    (e?: React.ChangeEvent<HTMLInputElement>, checked?: boolean) => {
      const newToggleValue = checked ?? e?.target?.checked ?? false

      if (!newToggleValue && items.length === 0) {
        showToast?.({
          message: formatMessage(messages.searchEmptyCart),
        })

        return
      }

      setSearchStore(newToggleValue)

      if (newToggleValue) {
        toggleRef.current?.setAttribute('style', 'display: none;')
        autocompleteRef.current?.setAttribute('style', 'display: flex;')
      } else {
        autocompleteRef.current?.setAttribute('style', 'display: none;')
        toggleRef.current?.setAttribute('style', 'display: flex;')

        const searchCartInput = tableRef.current?.querySelector(
          '#toolbar .vtex-styleguide-9-x-input'
        ) as HTMLInputElement | null

        searchCartInput?.focus()
      }
    },
    [setSearchStore, items.length, showToast, formatMessage]
  )

  useEffect(() => {
    if (!loading && (!items.length || searchStore)) {
      window.setTimeout(() => handleToggleSearchStore(undefined, true))
    }
  }, [loading, items.length, searchStore, handleToggleSearchStore])

  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (!toggleRef.current || !tableRef.current || !autocompleteRef.current)
        return

      const toolbarElement = tableRef.current.querySelector('#toolbar')
      const inputWrapperElement = toolbarElement?.querySelector('.w-40')

      if (!toolbarElement || !inputWrapperElement) return

      if (!toggleRef.current.classList.contains('dn')) {
        observer.disconnect()

        return
      }

      toolbarElement.prepend(toggleRef.current)
      toolbarElement.prepend(autocompleteRef.current)
      toggleRef.current.prepend(inputWrapperElement)
      inputWrapperElement.classList.remove('w-40')
      inputWrapperElement.classList.add('flex-auto')
      toggleRef.current.classList.remove('dn')
      toggleRef.current.classList.add('flex', 'flex-wrap', 'items-center')
    })

    if (tableRef.current) {
      observer.observe(tableRef.current, {
        attributes: true,
        childList: true,
        subtree: true,
      })
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div className={handles.container}>
      <Layout
        fullWidth
        pageHeader={
          <PageHeader
            title={<ExtensionPoint id="rich-text" />}
            linkLabel={formatMessage(messages.backToHome)}
            onLinkClick={() =>
              navigate({ page: 'store.home', fallbackToWindowLocation: true })
            }
          >
            <SavedCarts />
          </PageHeader>
        }
      >
        <PageBlock>
          {!loading && (
            <div className="mb4">
              <ContactInfos />
              <Totalizer items={totalizers} />
            </div>
          )}

          <div className={handles.table}>
            <div className="dn w-100 w-60-m" ref={toggleRef}>
              <Toggle
                label={formatMessage(messages.searchProductsToggle)}
                checked={searchStore}
                onChange={handleToggleSearchStore}
              />
            </div>

            <div
              className={`${handles.containerToggle} dn flex-wrap items-center w-100 w-60-m`}
              ref={autocompleteRef}
            >
              <ProductAutocomplete />

              <Toggle
                label={formatMessage(messages.searchProductsToggle)}
                checked={searchStore}
                onChange={handleToggleSearchStore}
              />

              <Toggle
                label={formatMessage(messages.searchProductsGroupToggle)}
                checked={isGrouping}
                onChange={() => setIsGrouping((prev) => !prev)}
              />
            </div>

            <div ref={tableRef}>
              <Table
                updateTableKey={`table-${
                  'tax' in schema.properties ? 'with-tax' : 'no-tax'
                }${
                  'listPrice' in schema.properties ? 'with-margin' : 'no-margin'
                }${isGrouping ? 'grouping-products' : 'ungrouped-products'}`}
                onRowClick={() => {}}
                loading={loading}
                fullWidth
                schema={schema}
                items={filteredItems}
                density="high"
                emptyStateLabel={
                  searchQuery && !searchStore ? (
                    <div className="flex flex-column">
                      {formatMessage(messages.searchProductsEmpty, {
                        term: searchQuery,
                        type: SEARCH_TYPE.CART,
                      })}
                      <div className="mt4">
                        <Button
                          size="small"
                          variation="secondary"
                          onClick={() =>
                            handleToggleSearchStore(undefined, true)
                          }
                        >
                          {formatMessage(messages.searchProductsToggle)}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    formatMessage(messages.emptyCart)
                  )
                }
                toolbar={toolbar}
              />
            </div>
          </div>
        </PageBlock>
        {isEditing && (
          <Slider
            onChange={(values: number[]) => {
              const [newDiscount] = values

              setDiscountApplied(newDiscount)

              filteredItems.forEach((item) => {
                const originalPrice = item.manualPrice ?? item.sellingPrice ?? 0
                const discountedPrice = originalPrice * (1 - newDiscount / 100)

                updatePrice(item.id, Math.max(0, discountedPrice))
              })
            }}
            min={0}
            max={sliderMaxValue}
            step={1}
            defaultValues={[discountApplied]}
            formatValue={(value: number) => `${value}%`}
          />
        )}
        <div className="flex flex-wrap">
          {isSalesUser && (
            <>
              <Button
                variation={isEditing ? 'danger' : 'primary'}
                onClick={toggleEditMode}
              >
                {isEditing
                  ? formatMessage(messages.manualPriceStopEdit)
                  : formatMessage(messages.editManualPrice)}
              </Button>
              <Button
                variation="primary"
                onClick={handleSavePrices}
                isLoading={saving}
                disabled={!items.length || saving}
              >
                {formatMessage(messages.saveManualPrice)}
              </Button>
            </>
          )}
          {!!items.length && !loading && (
            <Button
              variation="danger-tertiary"
              onClick={clearCart}
              isLoading={clearCartLoading}
            >
              {formatMessage(messages.clearCart)}
            </Button>
          )}
        </div>
      </Layout>
    </div>
  )
}

function CheckoutB2BWrapper() {
  useEffect(welcome, [])

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider positioning="window">
        <CheckoutB2BProvider>
          <CheckoutB2B />
        </CheckoutB2BProvider>
      </ToastProvider>
    </QueryClientProvider>
  )
}

export default CheckoutB2BWrapper
