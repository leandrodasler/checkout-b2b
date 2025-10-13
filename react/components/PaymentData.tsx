import React, { useCallback, useEffect, useMemo } from 'react'
import { useIntl } from 'react-intl'
import { FormattedPrice } from 'vtex.formatted-price'
import { Dropdown } from 'vtex.styleguide'

import { useCheckoutB2BContext } from '../CheckoutB2BContext'
import {
  useFetchCustomerCredit,
  useOrderFormCustom,
  useOrganization,
  useUpdatePayment,
} from '../hooks'
import {
  CUSTOMER_CREDIT_ID,
  getFirstInstallmentByPaymentSystem,
  messages,
} from '../utils'
import { TotalizerSpinner } from './TotalizerSpinner'

export function PaymentData() {
  const { formatMessage } = useIntl()
  const { setPending } = useCheckoutB2BContext()
  const { orderForm, loading: orderFormLoading } = useOrderFormCustom()
  const { updatePayment, loading } = useUpdatePayment()
  const { value } = orderForm
  const { paymentSystems = [], payments = [], installmentOptions = [] } =
    orderForm.paymentData ?? {}

  const { organization } = useOrganization()
  const organizationPaymentSystems = useMemo(
    () =>
      organization.costCenter?.paymentTerms?.length
        ? organization.costCenter.paymentTerms
        : organization.paymentTerms ?? [],
    [organization.costCenter?.paymentTerms, organization.paymentTerms]
  )

  const organizationAcceptsPaymentSystem = useCallback(
    (id: string) =>
      !organizationPaymentSystems?.length ||
      organizationPaymentSystems?.some((paymentTerm) => paymentTerm?.id === id),
    [organizationPaymentSystems]
  )

  const filteredPaymentSystems = useMemo(
    () =>
      paymentSystems.filter(
        (paymentSystem) =>
          paymentSystem?.groupName !== 'creditCardPaymentGroup' &&
          organizationAcceptsPaymentSystem(paymentSystem.stringId)
      ),
    [organizationAcceptsPaymentSystem, paymentSystems]
  )

  const options = filteredPaymentSystems.map((paymentSystem) => ({
    value: paymentSystem?.stringId ?? '',
    label: paymentSystem?.name ?? '',
  }))

  const [selectedPayment] = payments

  const { data: customerCreditData, isLoading } = useFetchCustomerCredit({
    enabled: selectedPayment?.paymentSystem === CUSTOMER_CREDIT_ID,
  })

  const customerCreditLoading = useMemo(
    () => selectedPayment?.paymentSystem === CUSTOMER_CREDIT_ID && isLoading,
    [isLoading, selectedPayment?.paymentSystem]
  )

  const setPayment = useCallback(
    (newPaymentSystem: string) => {
      const installment = getFirstInstallmentByPaymentSystem(
        installmentOptions,
        newPaymentSystem
      )

      setPending(true)

      updatePayment({
        variables: {
          paymentData: {
            payments: [
              {
                paymentSystem: newPaymentSystem,
                referenceValue: installment?.value ?? value,
                installmentsInterestRate: installment?.interestRate ?? 0,
                installments: installment?.count ?? 1,
                value: installment?.total ?? value,
              },
            ],
          },
        },
      }).finally(() => setPending(false))
    },
    [installmentOptions, setPending, updatePayment, value]
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setPayment(e.target.value)
    },
    [setPayment]
  )

  const validPaymentSystem = filteredPaymentSystems.find(
    (paymentSystem) =>
      paymentSystem?.stringId === selectedPayment?.paymentSystem
  )

  useEffect(() => {
    if (
      !loading &&
      !orderFormLoading &&
      filteredPaymentSystems.length &&
      !validPaymentSystem
    ) {
      setPayment(filteredPaymentSystems[0].stringId)
    }
  }, [
    filteredPaymentSystems,
    loading,
    orderFormLoading,
    setPayment,
    validPaymentSystem,
  ])

  if (loading || customerCreditLoading) {
    return <TotalizerSpinner />
  }

  return (
    <Dropdown
      size="small"
      placeholder={formatMessage(messages.selectPaymentMethods)}
      options={options}
      value={selectedPayment?.paymentSystem}
      onChange={handleChange}
      helpText={
        selectedPayment?.paymentSystem === CUSTOMER_CREDIT_ID &&
        (customerCreditData ? (
          <div className="flex flex-wrap items-center justify-center">
            {formatMessage(messages.creditAvailable)}:{' '}
            <strong>
              <FormattedPrice value={customerCreditData?.availableCredit} />
            </strong>
          </div>
        ) : (
          formatMessage(messages.noCreditAvailable)
        ))
      }
    />
  )
}
