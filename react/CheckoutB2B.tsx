import { QueryClientProvider } from '@tanstack/react-query'
import React, { useCallback, useState } from 'react'
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
  Totalizer,
  withToast,
} from 'vtex.styleguide'

import { CheckoutB2BProvider } from './CheckoutB2BContext'
import { ContactInfos } from './components/ContactInfos'
import {
  useClearCart,
  useOrderFormCustom,
  useOrganization,
  useTableSchema,
  useToolbar,
  useTotalizers,
} from './hooks'
import { queryClient } from './services'
import './styles.css'
import { WithToast } from './typings'
import { messages } from './utils'

function CheckoutB2B({ showToast }: WithToast) {
  const handles = useCssHandles(['container', 'table'])
  const { organization, loading: organizationLoading } = useOrganization()
  const { loading: orderFormLoading, orderForm } = useOrderFormCustom()
  const { clearCart, isLoading: clearCartLoading } = useClearCart(showToast)
  const totalizers = useTotalizers()
  const [isEditing, setIsEditing] = useState(false)
  const [discount, setDiscount] = useState(0)
  const [prices, setPrices] = useState<Record<string, number>>({})
  const { formatMessage } = useIntl()
  const { navigate } = useRuntime()
  const { items } = orderForm
  const loading = orderFormLoading || organizationLoading
  const toolbar = useToolbar(showToast)
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
          />
        }
      >
        <PageBlock>
          {!loading && (
            <div className="mb4">
              <ContactInfos organization={organization} />
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
              toolbar={toolbar}
            />
          </div>
        </PageBlock>
        {isEditing && (
          <Slider
            onChange={(values: number[]) => {
              setDiscount(values[0])
            }}
            min={0}
            max={100}
            step={1}
            disabled={false}
            defaultValues={[0]}
            alwaysShowCurrentValue={false}
            formatValue={(a: number) => a + 1}
          />
        )}
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
          Salvar
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
      </Layout>
    </div>
  )
}

const CheckoutB2BWithToast = withToast(CheckoutB2B)

function CheckoutB2BWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider positioning="window">
        <CheckoutB2BProvider>
          <CheckoutB2BWithToast />
        </CheckoutB2BProvider>
      </ToastProvider>
    </QueryClientProvider>
  )
}

export default CheckoutB2BWrapper
