import { QueryClientProvider } from '@tanstack/react-query'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
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

import 'vtex.country-codes/locales'

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
import { WithToast } from './typings'
import { messages } from './utils'

import './styles.css'

function CheckoutB2B({ showToast }: WithToast) {
  const handles = useCssHandles(['container', 'table'])
  const { organization, loading: organizationLoading } = useOrganization()
  const { loading: orderFormLoading, orderForm } = useOrderFormCustom()
  const { clearCart, isLoading: clearCartLoading } = useClearCart(showToast)
  const totalizers = useTotalizers()
  const [isEditing, setIsEditing] = useState(false)
  const [discount, setDesconto] = useState(0)

  const schema = useTableSchema(isEditing, discount)

  const toolbar = useToolbar(showToast)
  const { navigate } = useRuntime()
  const { formatMessage } = useIntl()
  const { items } = orderForm
  const loading = orderFormLoading || organizationLoading
  const filteredItems = toolbar?.filteredItems ?? items
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
              setDesconto(values[0])
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
          {isEditing ? 'Parar edição' : 'editar todos'}
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
