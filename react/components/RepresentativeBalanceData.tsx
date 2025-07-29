import React from 'react'
import { useIntl } from 'react-intl'
import { Spinner, Tooltip } from 'vtex.styleguide'

import { useFormatPrice, useOrderFormCustom } from '../hooks'
import { useFetchRepresentativeBalance } from '../hooks/useFetchRepresentativeBalance'
import { messages } from '../utils'

export function RepresentativeBalanceData() {
  const { formatMessage } = useIntl()
  const formatPrice = useFormatPrice()

  const {
    orderForm: { clientProfileData, totalizers = [] },
  } = useOrderFormCustom()

  const email = clientProfileData?.email

  const {
    representativeBalance,
    loading,
    error,
  } = useFetchRepresentativeBalance({
    email,
  })

  const discounts =
    (totalizers.find((totalizer) => totalizer.id === 'Discounts')?.value ?? 0) /
    100

  const { balance } = representativeBalance

  if (!email) return null
  if (loading) return <Spinner size={16} />
  if (error) return <span>{formatMessage(messages.balanceError)}</span>
  if (!representativeBalance)
    return <span>{formatMessage(messages.noBalance)}</span>

  const finalBalance = parseFloat(balance.toFixed(2)) + discounts

  return (
    <span>
      {formatMessage(messages.availableBalance)}:{' '}
      <Tooltip
        label={
          <span>
            {formatMessage(messages.initialBalance)}:{' '}
            <b>{formatPrice(representativeBalance.balance)}</b>
            <br />
            {formatMessage(messages.discountChanges)}:{' '}
            <b>{formatPrice(discounts)}</b>
          </span>
        }
      >
        <b className={finalBalance < 0 ? 'c-danger' : 'c-action-primary'}>
          {formatPrice(finalBalance)}
        </b>
      </Tooltip>
    </span>
  )
}
