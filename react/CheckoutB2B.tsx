import { QueryClientProvider } from '@tanstack/react-query'
import React, { useCallback } from 'react'
import { useIntl } from 'react-intl'
import { useCssHandles } from 'vtex.css-handles'
import { OrderItems } from 'vtex.order-items'
import { ExtensionPoint, useRuntime } from 'vtex.render-runtime'
import {
  Button,
  Layout,
  PageBlock,
  PageHeader,
  Table,
  ToastProvider,
  Totalizer,
  withToast,
} from 'vtex.styleguide'
import './styles.css'

import { ContactInfos } from './components/ContactInfos'
import {
  useOrderFormCustom,
  useOrganization,
  useTableSchema,
  useToolbar,
  useTotalizers,
} from './hooks'
import { queryClient } from './services'
import { WithToast } from './typings'
import { messages } from './utils'

const { useOrderItems } = OrderItems

function CheckoutB2B({ showToast }: WithToast) {
  const handles = useCssHandles(['container', 'table'])
  const { organization, loading: organizationLoading } = useOrganization()
  const {
    loading: orderFormLoading,
    orderForm,
    setOrderForm,
  } = useOrderFormCustom()

  const loading = orderFormLoading || organizationLoading
  const { items } = orderForm
  const totalizers = useTotalizers()
  const schema = useTableSchema()
  const toolbar = useToolbar(showToast)
  const { navigate } = useRuntime()
  const { formatMessage } = useIntl()
  const { removeItem } = useOrderItems()

  const handleClearCart = useCallback(() => {
    items.forEach(({ id, seller }) => removeItem({ id, seller: seller ?? '1' }))
    setOrderForm({ ...orderForm, items: [], totalizers: [] })
  }, [items, orderForm, removeItem, setOrderForm])

  // eslint-disable-next-line no-console
  console.log('ORDER FORM:', orderForm)

  return (
    <div className={handles.container}>
      <Layout
        fullWidth
        pageHeader={
          <PageHeader
            title={<ExtensionPoint id="rich-text" />}
            linkLabel={formatMessage(messages.backToHome)}
            onLinkClick={() => navigate({ page: 'store.home' })}
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
              items={items}
              density="high"
              emptyStateLabel={formatMessage(messages.emptyCart)}
              toolbar={toolbar}
            />
          </div>
        </PageBlock>

        {!!items.length && !loading && (
          <Button variation="danger-tertiary" onClick={handleClearCart}>
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
        <CheckoutB2BWithToast />
      </ToastProvider>
    </QueryClientProvider>
  )
}

export default CheckoutB2BWrapper
