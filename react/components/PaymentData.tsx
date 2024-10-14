import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { OrderForm } from 'vtex.checkout-graphql'
import { Dropdown } from 'vtex.styleguide'

import { messages } from '../utils'

export function PaymentData({ data }: { data: OrderForm['paymentData'] }) {
  const { formatMessage } = useIntl()

  const [selectedPayment, setSelectedPayment] = useState<string | null>(null)
  const filteredPaymentSystems = data.paymentSystems.filter(
    (paymentSystem) => paymentSystem.groupName !== 'creditCardPaymentGroup'
  )

  const options = filteredPaymentSystems.map((paymentSystem) => ({
    value: paymentSystem.id,
    label: paymentSystem.name,
  }))

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPayment(e.target.value)
  }

  return (
    <div className="mb5">
      <Dropdown
        placeholder={formatMessage(messages.selectPaymentMethods)}
        options={options}
        value={selectedPayment ?? ''}
        onChange={handleChange}
      />
    </div>
  )
}
