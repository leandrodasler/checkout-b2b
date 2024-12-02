import { QueryClientProvider } from '@tanstack/react-query'
import React, { useMemo } from 'react'
import { useIntl } from 'react-intl'
import { useCssHandles } from 'vtex.css-handles'
import { ExtensionPoint, useRuntime } from 'vtex.render-runtime'
import {
  Button,
  Layout,
  PageBlock,
  PageHeader,
  Table,
  ToastProvider,
  Totalizer,
} from 'vtex.styleguide'

import 'vtex.country-codes/locales'

import { CheckoutB2BProvider } from './CheckoutB2BContext'
import { ContactInfos } from './components/ContactInfos'
import { SavedCarts } from './components/SavedCarts'
import {
  useClearCart,
  useOrderFormCustom,
  useOrganization,
  useTableSchema,
  useToolbar,
  useTotalizers,
} from './hooks'
import { queryClient } from './services'
import { messages } from './utils'

import './styles.css'

function CheckoutB2B() {
  const handles = useCssHandles(['container', 'table'])
  const { loading: organizationLoading } = useOrganization()
  const { loading: orderFormLoading, orderForm } = useOrderFormCustom()
  const { clearCart, isLoading: clearCartLoading } = useClearCart()
  const totalizers = useTotalizers()
  const schema = useTableSchema()
  const toolbar = useToolbar()
  const { navigate } = useRuntime()
  const { formatMessage } = useIntl()

  const { items } = orderForm
  const loading = useMemo(() => orderFormLoading || organizationLoading, [
    orderFormLoading,
    organizationLoading,
  ])

  const filteredItems = toolbar?.filteredItems ?? items

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
