import React, { useCallback, useEffect, useMemo } from 'react'
import { useMutation } from 'react-apollo'
import { useIntl } from 'react-intl'
import type {
  UpdateOrderFormProfileMutation,
  UpdateOrderFormProfileMutationVariables,
} from 'vtex.checkout-resources'
import { MutationUpdateOrderFormProfile } from 'vtex.checkout-resources'
import { Tag, Totalizer } from 'vtex.styleguide'
import { FormattedPrice } from 'vtex.formatted-price'

import { useOrderFormCustom, useOrganization } from '../hooks'
import { messages } from '../utils'
import { BillingAddress } from './BillingAddress'
import { ShippingAddress } from './ShippingAddress'
import { ShippingOption } from './ShippingOption'
import { useFetchCustomerCredit } from '../hooks/useFetchCustomerCredit'

export function ContactInfos() {
  const { formatMessage } = useIntl()
  const { organization } = useOrganization()
  const {
    orderForm: { clientProfileData, items },
  } = useOrderFormCustom()

  const {
    costCenter,
    users,
    tradeName,
    name,
    roleName,
    salesChannel,
  } = organization

  const costCenterPhone = costCenter?.phoneNumber ?? ''
  const clientProfilePhone = clientProfileData?.phone

  const { data } = useFetchCustomerCredit({
    email: clientProfileData?.email ?? '',
    skus: items.map((item) => item.id).join(','),
    salesChannel: salesChannel ?? '',
  })

  const organizationName = useMemo(() => (tradeName ?? '') || name, [
    name,
    tradeName,
  ])

  const phone = useMemo(() => costCenterPhone || clientProfilePhone, [
    clientProfilePhone,
    costCenterPhone,
  ])

  const [updateProfile] = useMutation<
    UpdateOrderFormProfileMutation,
    UpdateOrderFormProfileMutationVariables
  >(MutationUpdateOrderFormProfile)

  useEffect(() => {
    if (!clientProfileData || clientProfileData?.tradeName) return

    const {
      corporatePhone,
      profileCompleteOnLoading,
      profileErrorOnLoading,
      customerClass,
      ...inputProfileData
    } = clientProfileData

    updateProfile({
      variables: {
        profile: { ...inputProfileData, tradeName: organizationName },
      },
    })
  }, [clientProfileData, organizationName, phone, updateProfile])

  const getUsersByRole = useCallback(
    (role: string) =>
      users
        ?.filter((user) => user?.roleId === role)
        .map((user) => user?.name)
        .sort(),
    [users]
  )

  if (!clientProfileData) return null

  const { firstName, lastName, email } = clientProfileData
  const salesRepresentative = getUsersByRole('sales-representative')
  const salesAdmin = getUsersByRole('sales-admin')
  const contactFields: Array<{ label: string; value: React.ReactNode }> = []

  if (organization) {
    contactFields.push({
      label: formatMessage(messages.companyName),
      value: (
        <>
          <div className="mb1 flex items-center flex-wrap">
            {organizationName}
            {costCenter?.name && <Tag size="small">{costCenter?.name}</Tag>}
          </div>
          {(!!salesRepresentative?.length || !!salesAdmin?.length) && (
            <span className="t-mini">
              {!!salesRepresentative?.length && (
                <>
                  <span className="b">
                    {formatMessage(messages.salesRepresentative)}
                  </span>{' '}
                  {salesRepresentative.join(', ')}
                </>
              )}
              {!!salesRepresentative?.length && !!salesAdmin?.length && <br />}
              {!!salesAdmin?.length && (
                <>
                  <span className="b">
                    {formatMessage(messages.salesAdmin)}
                  </span>{' '}
                  {salesAdmin.join(', ')}
                </>
              )}
            </span>
          )}
        </>
      ),
    })
  }

  contactFields.push({
    label: formatMessage(messages.buyerName),
    value: (
      <>
        <div className="mb1 flex items-center flex-wrap">
          <span>
            {firstName} {lastName}
          </span>
          <Tag size="small">{roleName}</Tag>
        </div>
        <span className="t-mini">{email}</span>
        {phone && phone !== '+10000000000' && (
          <>
            <br />
            <span className="t-mini">{phone}</span>
          </>
        )}
      </>
    ),
  })

  contactFields.push({
    label: formatMessage(messages.shippingAddress),
    value: <ShippingAddress />,
  })

  contactFields.push({
    label: formatMessage(messages.billingAddress),
    value: <BillingAddress />,
  })

  if (items.length) {
    contactFields.push({
      label: formatMessage(messages.shippingOption),
      value: (
        <>
          <div className="mb4">
            <ShippingOption />
          </div>
          {data?.availableCredit ? (
            <>
              {formatMessage(messages.creditAvailable)} <br />
              <strong>
                <FormattedPrice value={data.availableCredit} />
              </strong>
            </>
          ) : (
            <span>{formatMessage(messages.noCreditAvailable)}</span>
          )}
        </>
      ),
    })
  }

  return (
    <div className="mb4">
      <Totalizer items={contactFields} />
    </div>
  )
}
