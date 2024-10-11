import React, { useCallback } from 'react'
import { useIntl } from 'react-intl'
import { useCssHandles } from 'vtex.css-handles'
import { OrderItems } from 'vtex.order-items'
import { ExtensionPoint, useRuntime } from 'vtex.render-runtime'
import { Button, Layout, PageBlock, PageHeader, Table } from 'vtex.styleguide'

import useOrderFormCustom from './hooks/useOrderFormCustom'
import { useTableSchema, useTotalizers } from './utils'
import { messages } from './utils/messages'

function CheckoutB2B() {
  const handles = useCssHandles(['container'])
  const { loading, orderForm, setOrderForm } = useOrderFormCustom()
  const {
    items,
    totalizers,
    shipping,
    value: total,
    paymentData,
    ...rest
  } = orderForm

  const { useOrderItems } = OrderItems
  const { removeItem } = useOrderItems()
  const mappedTotalizers = useTotalizers({
    totalizers,
    shipping,
    total,
    paymentData,
  })

  const schema = useTableSchema()

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
