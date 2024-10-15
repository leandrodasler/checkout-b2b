import React, { useCallback } from 'react'
import { useIntl } from 'react-intl'
import { useCssHandles } from 'vtex.css-handles'
import { OrderItems } from 'vtex.order-items'
import { ExtensionPoint, useRuntime } from 'vtex.render-runtime'
import { Button, Layout, PageBlock, PageHeader, Table } from 'vtex.styleguide'
import './styles.css'

import { useOrderFormCustom, useTableSchema, useTotalizers } from './hooks'
import { messages } from './utils'

function CheckoutB2B() {
  const handles = useCssHandles(['container', 'table'])

  const { loading, orderForm, setOrderForm } = useOrderFormCustom()
  const { useOrderItems } = OrderItems
  const { items } = orderForm
  const mappedTotalizers = useTotalizers(orderForm)
  const schema = useTableSchema()

  const { navigate } = useRuntime()
  const { formatMessage } = useIntl()
  const { removeItem } = useOrderItems()

  const handleClearCart = useCallback(() => {
    items.forEach(({ id, seller }) => removeItem({ id, seller: seller ?? '1' }))
    setOrderForm({
      ...orderForm,
      items: [],
      totalizers: [],
    })
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
          <div className={handles.table}>
            <Table
              totalizers={mappedTotalizers}
              loading={loading}
              fullWidth
              schema={schema}
              items={items}
              density="high"
              emptyStateLabel={formatMessage(messages.emptyCart)}
            />
          </div>
        </PageBlock>

        {!!items.length && (
          <Button variation="danger-tertiary" onClick={handleClearCart}>
            {formatMessage(messages.clearCart)}
          </Button>
        )}
      </Layout>
    </div>
  )
}

export default CheckoutB2B
