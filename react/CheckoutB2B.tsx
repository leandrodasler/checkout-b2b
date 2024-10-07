import React from 'react'
import { Table } from 'vtex.styleguide'

import useOrderFormCustom from './hooks/useOrderFormCustom'
import { useTableSchema, useTotalizers } from './utils'

function CheckoutB2B() {
  const { loading, orderForm } = useOrderFormCustom()
  const { items, totalizers, shipping, value: total, ...rest } = orderForm
  const mappedTotalizers = useTotalizers(totalizers, shipping, total)
  const schema = useTableSchema()

  // eslint-disable-next-line no-console
  console.log('OUTROS OBJETOS NO ORDER FORM:', rest)

  return (
    <Table
      totalizers={mappedTotalizers}
      loading={loading}
      fullWidth
      schema={schema}
      items={items}
      density="high"
    />
  )
}

export default CheckoutB2B
