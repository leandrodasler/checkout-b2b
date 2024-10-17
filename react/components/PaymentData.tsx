import React from 'react'
import { useMutation } from 'react-apollo'
import { useIntl } from 'react-intl'
import { OrderForm, PaymentDataInput } from 'vtex.checkout-graphql'
import type { UpdateOrderFormPaymentMutation } from 'vtex.checkout-resources'
import { MutationUpdateOrderFormPayment } from 'vtex.checkout-resources'
import { Dropdown, Spinner, withToast } from 'vtex.styleguide'

import { useOrderFormCustom } from '../hooks'
import { WithToast } from '../typings'
import { messages } from '../utils'

function PaymentDataWrapper({ showToast }: WithToast) {
  const { orderForm, setOrderForm } = useOrderFormCustom()
  const { formatMessage } = useIntl()

  const [updatePayment, { loading }] = useMutation<
    UpdateOrderFormPaymentMutation,
    { paymentData: PaymentDataInput }
  >(MutationUpdateOrderFormPayment, {
    onCompleted({ updateOrderFormPayment }) {
      setOrderForm(updateOrderFormPayment as OrderForm)
    },
    onError({ message }) {
      showToast({ message })
    },
  })

  const { paymentSystems, payments } = orderForm.paymentData

  const filteredPaymentSystems = paymentSystems.filter(
    (paymentSystem) => paymentSystem.groupName !== 'creditCardPaymentGroup'
  )

  const options = filteredPaymentSystems.map((paymentSystem) => ({
    value: paymentSystem.id,
    label: paymentSystem.name,
  }))

  const selectedPayment = payments[0]?.paymentSystem

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updatePayment({
      variables: {
        paymentData: {
          payments: [
            {
              paymentSystem: e.target.value,
              referenceValue: orderForm.value,
              value: orderForm.value,
            },
          ],
        },
      },
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center">
        <Spinner size={32} />
      </div>
    )
  }

  return (
    <Dropdown
      size="small"
      placeholder={formatMessage(messages.selectPaymentMethods)}
      options={options}
      value={selectedPayment}
      onChange={handleChange}
    />
  )
}

export const PaymentData = withToast(PaymentDataWrapper)
