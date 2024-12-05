import { QueryClientProvider } from '@tanstack/react-query'
import React, { useCallback, useMemo, useState } from 'react'
import { useMutation, useQuery } from 'react-apollo'
import { useIntl } from 'react-intl'
import { Query } from 'ssesandbox04.checkout-b2b'
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
  Totalizer,
} from 'vtex.styleguide'

import { CheckoutB2BProvider } from './CheckoutB2BContext'
import { ContactInfos } from './components/ContactInfos'
import { SavedCarts } from './components/SavedCarts'
import GET_APP_SETTINGS from './graphql/getAppSettings.graphql'
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
import { messages } from './utils'

type AppSettingsQuery = Pick<Query, 'getAppSettings'>

function CheckoutB2B() {
  const handles = useCssHandles(['container', 'table'])
  const { loading: organizationLoading } = useOrganization()
  const { loading: orderFormLoading, orderForm } = useOrderFormCustom()
  const { clearCart, isLoading: clearCartLoading } = useClearCart()
  const totalizers = useTotalizers()
  const toolbar = useToolbar()
  const { navigate } = useRuntime()
  const [isEditing, setIsEditing] = useState(false)
  const [discount, setDiscount] = useState(0)
  const [prices, setPrices] = useState<Record<string, number>>({})
  const { formatMessage } = useIntl()
  const { items } = orderForm
  const loading = useMemo(() => orderFormLoading || organizationLoading, [
    orderFormLoading,
    organizationLoading,
  ])

  const showToast = useToast()

  const { data } = useQuery<AppSettingsQuery>(GET_APP_SETTINGS, { ssr: false })
  const { maximumDiscount } = usePermissions(data?.getAppSettings)

  const filteredItems = toolbar?.filteredItems ?? items

  const updatePrice = useCallback((id: string, newPrice: number) => {
    setPrices((prevPrices) => ({
      ...prevPrices,
      [id]: newPrice,
    }))
  }, [])

  const schema = useTableSchema(isEditing, discount, updatePrice)

  const [setManualPrice, { loading: saving }] = useMutation(
    MutationSetManualPrice,
    {
      onCompleted: () => {
        showToast?.({ message: 'Preços atualizados com sucesso!' })
      },
      onError: (error) => {
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
    const updatedPrices = getUpdatedPrices()

    try {
      await Promise.all(
        updatedPrices.map((item) =>
          setManualPrice({
            variables: {
              orderFormId: item.orderFormId,
              manualPriceInput: {
                itemIndex: item.itemIndex,
                price: Math.round(item.price),
              },
            },
          })
        )
      )
      showToast?.({ message: 'Todos os preços foram atualizados com sucesso!' })
    } catch (error) {
      console.error('Erro ao atualizar os preços:', error.message)
      showToast?.({ message: 'Erro ao atualizar os preços.' })
    }
  }

  const toggleEditMode = () => {
    setIsEditing((prev) => !prev)
  }

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
            <Table
              loading={loading}
              fullWidth
              schema={schema}
              items={filteredItems}
              density="high"
              emptyStateLabel={formatMessage(messages.emptyCart)}
              toolbar={!loading && toolbar}
            />
          </div>
        </PageBlock>
        {isEditing && (
          <Slider
            onChange={(values: number[]) => {
              setDiscount(values[0])
            }}
            min={0}
            max={maximumDiscount}
            step={1}
            disabled={false}
            defaultValues={[0]}
            alwaysShowCurrentValue={false}
            formatValue={(a: number) => `${a}%`}
          />
        )}
        <div className="flex flex-wrap">
          <Button
            variation={isEditing ? 'danger' : 'primary'}
            onClick={toggleEditMode}
          >
            {isEditing ? 'Parar edição' : 'Editar todos'}
          </Button>
          <Button
            variation="primary"
            onClick={handleSavePrices}
            isLoading={saving}
            disabled={!items.length || saving}
          >
            Aplicar Preços
          </Button>

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
