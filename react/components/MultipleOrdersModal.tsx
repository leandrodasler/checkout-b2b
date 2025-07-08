import React from 'react'
import { useIntl } from 'react-intl'
import { EXPERIMENTAL_Modal as Modal } from 'vtex.styleguide'

import { useCheckoutB2BContext } from '../CheckoutB2BContext'
import { getOrderPlacedUrl, messages } from '../utils'

export function MultipleOrdersModal() {
  const { formatMessage } = useIntl()
  const { orderGroups, setOrderGroups } = useCheckoutB2BContext()

  if (!orderGroups?.length) return null

  return (
    <Modal
      isOpen={orderGroups.length}
      onClose={() => setOrderGroups(undefined)}
      centered
      size="small"
      title={formatMessage(messages.placeOrder)}
    >
      {orderGroups?.map((orderGroup) => (
        <div key={orderGroup.orderGroup}>
          <span className="b">{orderGroup.costCenter}</span>:{' '}
          <a
            href={getOrderPlacedUrl(orderGroup.orderGroup)}
            target="_blank"
            rel="noopener noreferrer"
          >
            {orderGroup.orderGroup}
          </a>
        </div>
      ))}
    </Modal>
  )
}
