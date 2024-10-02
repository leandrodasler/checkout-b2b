import React from 'react'
import { Table } from 'vtex.styleguide'

import useOrderFormCustom from './hooks/useOrderFormCustom'
import { getTotalizers, tableSchema } from './utils'

function CheckoutB2B() {
  const { loading, orderForm } = useOrderFormCustom()
  const { items, totalizers, value: total, ...rest } = orderForm
  const mappedTotalizers = getTotalizers(totalizers, total)

  // eslint-disable-next-line no-console
  console.log('ITEMS:', items)

  // eslint-disable-next-line no-console
  console.log('OUTROS OBJETOS NO ORDER FORM:', rest)

  return (
    <Table
      totalizers={mappedTotalizers}
      loading={loading}
      fullWidth
      schema={tableSchema}
      items={items}
      density="high"
    />
  )
}

export default CheckoutB2B
