import React, { useCallback } from 'react'
import { useIntl } from 'react-intl'
import { OrderItems } from 'vtex.order-items'
import { useCssHandles } from 'vtex.css-handles'
import { ExtensionPoint, useRuntime } from 'vtex.render-runtime'
import { Button, Layout, PageBlock, PageHeader, Table } from 'vtex.styleguide'

import { messages } from './utils'
import { useTableSchema, useOrderFormCustom, useTotalizers } from './hooks'

function CheckoutB2B() {
  const handles = useCssHandles(['container'])

  const { loading, orderForm, setOrderForm } = useOrderFormCustom()
  const { items, totalizers, shipping, value: total, ...rest } = orderForm

  const { useOrderItems } = OrderItems
  const schema = useTableSchema()
  const { removeItem } = useOrderItems()

  const mappedTotalizers = useTotalizers(totalizers, shipping, total)

  const { navigate } = useRuntime()
  const { formatMessage } = useIntl()

  // eslint-disable-next-line no-console
  console.log('OUTROS OBJETOS NO ORDER FORM:', rest)

  const handleClearCart = useCallback(() => {
    items.forEach(({ id, seller }) => removeItem({ id, seller: seller ?? '1' }))
    setOrderForm({
      ...orderForm,
      items: [],
      totalizers: [],
    })
  }, [items, orderForm, removeItem, setOrderForm])

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
          <Table
            fixFirstColumn
            totalizers={mappedTotalizers}
            loading={loading}
            fullWidth
            schema={schema}
            items={items}
            density="high"
            emptyStateLabel={formatMessage(messages.emptyCart)}
          />
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
