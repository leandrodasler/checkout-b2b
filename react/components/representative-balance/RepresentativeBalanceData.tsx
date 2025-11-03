import React from 'react'
import { useIntl } from 'react-intl'
import { Spinner, Tooltip } from 'vtex.styleguide'

import {
  useFormatPrice,
  useOrderFormCustom,
  useOrganization,
} from '../../hooks'
import { useFetchRepresentativeBalance } from '../../hooks/useFetchRepresentativeBalance'
import { messages } from '../../utils'

export function RepresentativeBalanceData() {
  const { formatMessage } = useIntl()
  const formatPrice = useFormatPrice()
  const { organization } = useOrganization()
  const { role } = organization

  const {
    orderForm: { items, clientProfileData, totalizers = [] },
  } = useOrderFormCustom()

  const hasManualPrice = items?.some(
    (item) => item.manualPrice && item.manualPrice !== item.price
  )

  const discountTotalizerValue =
    totalizers.find((totalizer) => totalizer.id === 'Discounts')?.value ?? 0

  const discounts = hasManualPrice ? discountTotalizerValue / 100 : 0

  const email = clientProfileData?.email

  const {
    representativeBalance,
    loading,
    error,
  } = useFetchRepresentativeBalance({
    email,
    skip: !email || role !== 'sales-representative',
  })

  if (!email) return null
  if (loading) return <Spinner size={16} />
  if (error) return <span>{formatMessage(messages.balanceError)}</span>
  if (!representativeBalance) return null
  const finalBalance =
    parseFloat((representativeBalance?.balance ?? 0).toFixed(2)) + discounts

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
            <b>
              {discounts > 0 && '+'}
              {formatPrice(discounts)}
            </b>
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
