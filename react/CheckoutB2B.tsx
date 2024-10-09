import React from 'react'
import { useIntl } from 'react-intl'
import { ExtensionPoint, useRuntime } from 'vtex.render-runtime'
import { Layout, PageBlock, PageHeader, Table } from 'vtex.styleguide'

import useOrderFormCustom from './hooks/useOrderFormCustom'
import { useTableSchema, useTotalizers } from './utils'
import { messages } from './utils/messages'

function CheckoutB2B() {
  const { loading, orderForm } = useOrderFormCustom()
  const { items, totalizers, shipping, value: total, ...rest } = orderForm
  const mappedTotalizers = useTotalizers(totalizers, shipping, total)
  const schema = useTableSchema()

  const { navigate } = useRuntime()
  const { formatMessage } = useIntl()

  // eslint-disable-next-line no-console
  console.log('OUTROS OBJETOS NO ORDER FORM:', rest)

  return (
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
        />
      </PageBlock>
    </Layout>
  )
}

export default CheckoutB2B
