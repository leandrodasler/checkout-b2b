import React from 'react'
import { useIntl } from 'react-intl'
import { useCssHandles } from 'vtex.css-handles'
import { FormattedPrice } from 'vtex.formatted-price'
import {
  Link,
  EXPERIMENTAL_Modal as Modal,
  Table,
  Tooltip,
} from 'vtex.styleguide'

import { useCheckoutB2BContext } from '../CheckoutB2BContext'
import { TableSchema } from '../typings'
import { getOrderPlacedUrl, messages } from '../utils'

type OrderRow = {
  costId: string
  costCenterName: string
  orderGroup: string
  value: number
  isTotal?: boolean
}

export function MultipleOrdersModal() {
  const handles = useCssHandles(['table'])
  const { formatMessage } = useIntl()
  const { orderGroups, setOrderGroups } = useCheckoutB2BContext()

  if (!orderGroups?.length) return null

  const schema: TableSchema<OrderRow> = {
    properties: {
      costCenterName: {
        title: formatMessage(messages.costCenterSingleLabel),
        cellRenderer({ rowData: { costCenterName } }) {
          if (!costCenterName) return null

          return costCenterName
        },
      },
      orderGroup: {
        title: formatMessage(messages.order),
        cellRenderer({ rowData: { orderGroup, isTotal } }) {
          if (isTotal) {
            return (
              <span className="b w-100 tr">
                {formatMessage(messages.total)}
              </span>
            )
          }

          if (!orderGroup) return null

          return (
            <Tooltip label={formatMessage(messages.multipleOrdersLink)}>
              <div>
                <Link href={getOrderPlacedUrl(orderGroup)} target="_blank">
                  <span className="c-action-primary">#{orderGroup}</span>
                </Link>
              </div>
            </Tooltip>
          )
        },
      },
      value: {
        width: 130,
        title: formatMessage(messages.total),
        cellRenderer({ rowData }) {
          return (
            <div className={rowData.isTotal ? 'b' : ''}>
              <FormattedPrice value={rowData.value / 100} />
            </div>
          )
        },
      },
    },
  }

  const total = orderGroups.reduce(
    (acc: number, order: OrderRow) => acc + order.value,
    0
  )

  const orderGroupsWithTotal = [
    ...orderGroups,
    {
      costCenterName: '',
      orderGroup: '',
      value: total,
      isTotal: true,
    },
  ]

  return (
    <Modal
      isOpen={orderGroups.length}
      onClose={() => setOrderGroups(undefined)}
      centered
      title={formatMessage(messages.multipleOrdersTitle, {
        count: orderGroups.length,
      })}
    >
      <div className={handles.table}>
        <Table
          onRowClick={() => {}}
          fullWidth
          schema={schema}
          items={orderGroupsWithTotal}
        />
      </div>
    </Modal>
  )
}
