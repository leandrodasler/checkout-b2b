import { QueryClientProvider } from '@tanstack/react-query'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useMutation } from 'react-apollo'
import { useIntl } from 'react-intl'
import { Mutation, MutationUpdatePricesArgs } from 'ssesandbox04.checkout-b2b'
import 'vtex.country-codes/locales'
import { useCssHandles } from 'vtex.css-handles'
import { ExtensionPoint, useRuntime } from 'vtex.render-runtime'
import {
  Box,
  Button,
  ButtonWithIcon,
  IconDelete,
  IconDownload,
  Layout,
  ModalDialog,
  PageBlock,
  PageHeader,
  Slider,
  Table,
  ToastProvider,
  Toggle,
  Tooltip,
  Totalizer,
} from 'vtex.styleguide'

import {
  CheckoutB2BProvider,
  useCheckoutB2BContext,
} from './CheckoutB2BContext'
import ProductAutocomplete from './components/cart-items/ProductAutocomplete'
import { ShareCartPDF } from './components/footer-actions/ShareCartPDF'
import { UploadSpreadsheetForm } from './components/footer-actions/SpreadsheetUploader'
import { SavedCarts } from './components/saved-carts/SavedCarts'
import { ContactInfos } from './components/totalizers/ContactInfos'
import MUTATION_UPDATE_PRICES from './graphql/updatePrices.graphql'
import {
  useClearCart,
  useGroupedProducts,
  useOrderFormCustom,
  useOrganization,
  usePermissions,
  useSavedCart,
  useTableSchema,
  useToast,
  useToolbar,
  useTotalizers,
  useUpdateItemsQuantity,
} from './hooks'
import { queryClient } from './services'
import './styles.css'
import { CompleteOrderForm, CustomItem } from './typings'
import {
  getOrderFormSavedCart,
  isItemUnavailable,
  messages,
  SEARCH_TYPE,
  welcome,
} from './utils'

type MutationUpdatePrices = Pick<Mutation, 'updatePrices'>

function CheckoutB2B() {
  const handles = useCssHandles([
    'container',
    'table',
    'containerToggle',
    'groupToggles',
  ])

  const { loading: organizationLoading } = useOrganization()
  const {
    loading: orderFormLoading,
    orderForm,
    setOrderForm,
  } = useOrderFormCustom()

  const totalizers = useTotalizers()
  const {
    discountApplied = 0,
    setDiscountApplied,
    subtotal,
    listedPrice,
    percentualDiscount,
    setPercentualDiscount,
    searchQuery,
    searchStore,
    setSearchStore,
    getDiscountedPrice,
    refetchCurrentSavedCart,
    selectedCart,
    setSelectedCart,
    setUseCartLoading,
  } = useCheckoutB2BContext()

  const [itemsAwaitingDeletion, setItemsAwaitingDeletion] = useState<
    CustomItem[]
  >([])

  const handleClearAwaitingDeletion = () => setItemsAwaitingDeletion([])

  const { clearCart, isLoading: clearCartLoading } = useClearCart({
    onChangeItems: handleClearAwaitingDeletion,
  })

  const [expandedProducts, setExpandedProducts] = useState<string[]>([])

  const [isGrouping, setIsGrouping] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const toolbar = useToolbar({
    onChangeItems: handleClearAwaitingDeletion,
  })

  const { navigate, query, culture } = useRuntime()
  const [prices, setPrices] = useState<Record<string, number>>({})
  const { formatMessage } = useIntl()
  const { items } = orderForm
  const customAppSavedCartId = getOrderFormSavedCart(orderForm.customData)
  const { handleUseSavedCart, loading: useCartLoading } = useSavedCart()

  useEffect(() => {
    if (
      query?.savedCart &&
      query.savedCart !== customAppSavedCartId &&
      selectedCart &&
      !useCartLoading
    ) {
      handleUseSavedCart(selectedCart)
    }
  }, [
    customAppSavedCartId,
    handleUseSavedCart,
    query?.savedCart,
    selectedCart,
    useCartLoading,
  ])

  const loading = useMemo(() => orderFormLoading || organizationLoading, [
    orderFormLoading,
    organizationLoading,
  ])

  const showToast = useToast()

  const { exceedingDiscount, maximumDiscount, isSalesUser } = usePermissions()

  const [
    updateItemsQuantity,
    { loading: removeLoading },
  ] = useUpdateItemsQuantity()

  useEffect(() => {
    if (listedPrice > 0) {
      const discountPercentage = ((listedPrice - subtotal) / listedPrice) * 100

      setPercentualDiscount(discountPercentage)
    }
  }, [listedPrice, subtotal, setPercentualDiscount])

  const sliderMaxValue = useMemo(() => {
    return Math.round(
      Math.min(maximumDiscount, maximumDiscount - percentualDiscount)
    )
  }, [maximumDiscount, percentualDiscount])

  const isExceedingDiscount =
    exceedingDiscount > 0 && percentualDiscount <= maximumDiscount

  const [isRequestingDiscount, setIsRequestingDiscount] = useState(false)

  const filteredItems = useGroupedProducts({
    items,
    fallbackItems: toolbar?.filteredItems,
    isGrouping,
    expandedProducts,
    searchStore,
    getDiscountedPrice,
    discountApplied,
  })

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
    itemsAwaitingDeletion,
    setItemsAwaitingDeletion,
    removeLoading,
  })

  const handleUpdateItemsPriceSuccess = useCallback(() => {
    refetchCurrentSavedCart()
    setDiscountApplied(0)
    setIsRequestingDiscount(false)
    setIsEditing(false)

    showToast?.({
      message: formatMessage(messages.manualPriceSuccess),
    })
  }, [formatMessage, refetchCurrentSavedCart, setDiscountApplied, showToast])

  const [updateItemsPrice, { loading: saving }] = useMutation<
    MutationUpdatePrices,
    MutationUpdatePricesArgs
  >(MUTATION_UPDATE_PRICES, {
    onCompleted: ({ updatePrices }) => {
      setOrderForm({
        ...orderForm,
        ...updatePrices,
        customData: updatePrices.customData,
      } as CompleteOrderForm)

      handleUpdateItemsPriceSuccess()
    },
    onError: (error) => {
      if (error.message.includes('code 304')) {
        handleUpdateItemsPriceSuccess()

        return
      }

      showToast({
        message: formatMessage(messages.manualPriceError, {
          error: error.message,
        }),
      })
    },
  })

  const getUpdatedPrices = useCallback(() => {
    return filteredItems.map((item, index) => ({
      index,
      price: Math.round(
        prices[item.id] ?? item.manualPrice ?? item.sellingPrice
      ),
    }))
  }, [filteredItems, prices])

  const handleSavePrices = async () => {
    if (percentualDiscount > maximumDiscount) {
      showToast({
        message: formatMessage(messages.manualPriceDiscountExceeded, {
          value: maximumDiscount,
        }),
      })

      return
    }

    const additionalData = JSON.stringify({
      paymentAddress: orderForm.paymentAddress,
      customData: orderForm.customData,
    })

    const title = formatMessage(messages.savedCartsSaveDefaultTitle, {
      date: new Date().toLocaleString(culture.locale),
    })

    setUseCartLoading(true)
    setSelectedCart(null)

    updateItemsPrice({
      variables: {
        items: getUpdatedPrices(),
        additionalData,
        title,
      },
    }).then(() => setUseCartLoading(false))
  }

  const toggleEditMode = () => {
    setIsEditing((prev) => !prev)

    if (!isEditing) return

    setDiscountApplied(0)
    const oldPrices: Record<string, number> = {}

    items.forEach((item) => (oldPrices[item.id] = item.sellingPrice ?? 0))
    setPrices(oldPrices)
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
      toggleRef.current.classList.add('flex', 'items-center')
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

  const pdfElementRef = useRef<HTMLDivElement>(null)

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
            <SavedCarts onChangeItems={handleClearAwaitingDeletion} />
          </PageHeader>
        }
      >
        <div ref={pdfElementRef}>
          <PageBlock>
            {!loading && (
              <div className="mb4">
                <Box title={formatMessage(messages.totalizerBoxTitle)}>
                  <ContactInfos onChangeItems={handleClearAwaitingDeletion} />
                  <Totalizer items={totalizers} />
                </Box>
              </div>
            )}

            <div className={handles.table}>
              <div
                className={`${handles.groupToggles} dn w-100 w-60-m`}
                ref={toggleRef}
              >
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

              <div
                className={`${handles.containerToggle} dn flex-wrap items-center w-100 w-60-m`}
                ref={autocompleteRef}
              >
                <ProductAutocomplete
                  onChangeItems={handleClearAwaitingDeletion}
                />

                <div className={`${handles.groupToggles} flex items-center`}>
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
              </div>

              <div ref={tableRef}>
                <Table
                  updateTableKey={`table-${
                    'tax' in schema.properties ? 'with-tax' : 'no-tax'
                  }${
                    'costCenter' in schema.properties
                      ? 'with-costCenter'
                      : 'no-costCenter'
                  }${
                    'listPrice' in schema.properties
                      ? 'with-margin'
                      : 'no-margin'
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
              {!loading &&
                filteredItems.some((item) => !isItemUnavailable(item)) && (
                  <div className="mt4 c-muted-2">
                    {formatMessage(messages.itemCount, {
                      count: filteredItems
                        .filter((item) => !isItemUnavailable(item))
                        .reduce(
                          (acc: number, item: CustomItem) =>
                            acc + (isGrouping && !item.__group ? 0 : 1),
                          0
                        ),
                    })}
                  </div>
                )}
            </div>
          </PageBlock>
        </div>
        {isEditing && !!items.length && (
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
        <div className="flex justify-between mt4">
          <div className="flex flex-wrap items-center">
            {!!items.length && isSalesUser && (
              <>
                <Button
                  variation={isEditing ? 'danger' : 'primary'}
                  onClick={toggleEditMode}
                >
                  {isEditing
                    ? formatMessage(messages.cancel)
                    : formatMessage(messages.editManualPrice)}
                </Button>
                {isEditing && (
                  <Button
                    variation="primary"
                    onClick={
                      isExceedingDiscount
                        ? () => setIsRequestingDiscount(true)
                        : handleSavePrices
                    }
                    isLoading={saving}
                    disabled={saving}
                  >
                    {isExceedingDiscount
                      ? formatMessage(messages.requestDiscount)
                      : formatMessage(messages.saveManualPrice)}
                  </Button>
                )}
              </>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-end">
            {!!items.length && !loading && (
              <>
                <ShareCartPDF mainRef={pdfElementRef} />
                <Tooltip
                  label={formatMessage(messages.importSpreadsheetCartHelp)}
                >
                  <div>
                    <ButtonWithIcon
                      icon={<IconDownload />}
                      variation="tertiary"
                      href="/_v/checkout-b2b/cart.csv"
                      target="_blank"
                    >
                      {formatMessage(messages.importSpreadsheetCart)}
                    </ButtonWithIcon>
                  </div>
                </Tooltip>
              </>
            )}

            <UploadSpreadsheetForm
              onChangeItems={handleClearAwaitingDeletion}
            />

            {!!items.length && !loading && (
              <ButtonWithIcon
                icon={<IconDelete />}
                variation="danger-tertiary"
                onClick={clearCart}
                isLoading={clearCartLoading}
              >
                {formatMessage(messages.clearCart)}
              </ButtonWithIcon>
            )}

            {itemsAwaitingDeletion.length > 0 && !loading && (
              <ButtonWithIcon
                icon={<IconDelete />}
                variation="danger-tertiary"
                isLoading={removeLoading}
                onClick={() => {
                  const orderItems = itemsAwaitingDeletion.map((item) => ({
                    index: item.itemIndex,
                    quantity: 0,
                  }))

                  updateItemsQuantity({
                    variables: {
                      orderItems,
                    },
                  }).then(handleClearAwaitingDeletion)
                }}
              >
                {formatMessage(messages.deletedSelectedItems)}
              </ButtonWithIcon>
            )}
          </div>
        </div>
        <ModalDialog
          centered
          title={formatMessage(messages.modalRequestDiscount)}
          loading={saving}
          confirmation={{
            onClick: handleSavePrices,
            label: formatMessage(messages.confirm),
          }}
          cancelation={{
            onClick: () => setIsRequestingDiscount(false),
            label: formatMessage(messages.cancel),
          }}
          onClose={() => setIsRequestingDiscount(false)}
          isOpen={isRequestingDiscount}
        >
          <p>{formatMessage(messages.modalRequestDiscountConfirmation)}</p>
        </ModalDialog>
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
