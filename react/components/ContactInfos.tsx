import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useMutation } from 'react-apollo'
import { useIntl } from 'react-intl'
import type {
  UpdateOrderFormProfileMutation,
  UpdateOrderFormProfileMutationVariables,
} from 'vtex.checkout-resources'
import { MutationUpdateOrderFormProfile } from 'vtex.checkout-resources'
import { Tag, Totalizer } from 'vtex.styleguide'

import { useOrderFormCustom, useOrganization, usePermissions } from '../hooks'
import { MAX_SALES_USERS_TO_SHOW, messages } from '../utils'
import { BillingAddress } from './BillingAddress'
import { CostCentersShipping } from './CostCentersShipping'
import { RepresentativeBalanceData } from './RepresentativeBalanceData'
import { ShowMoreButton } from './ShowMoreButton'

export function ContactInfos() {
  const { formatMessage } = useIntl()
  const { organization } = useOrganization()
  const {
    orderForm: { clientProfileData },
  } = useOrderFormCustom()

  const { representativeBalanceEnabled } = usePermissions()
  const { costCenter, users, tradeName, name, roleName } = organization
  const [showMoreSalesAdmin, setShowMoreSalesAdmin] = useState(false)

  const [
    showMoreSalesRepresentative,
    setShowMoreSalesRepresentative,
  ] = useState(false)

  const costCenterPhone = costCenter?.phoneNumber ?? ''
  const clientProfilePhone = clientProfileData?.phone

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
  const contactFields: Array<{
    label: string
    value: React.ReactNode
  }> = []

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
                  {showMoreSalesRepresentative
                    ? salesRepresentative.join(', ')
                    : salesRepresentative
                        .slice(0, MAX_SALES_USERS_TO_SHOW)
                        .join(', ')}
                  {salesRepresentative.length > MAX_SALES_USERS_TO_SHOW && (
                    <ShowMoreButton
                      isExpanded={showMoreSalesRepresentative}
                      onClick={() =>
                        setShowMoreSalesRepresentative(
                          !showMoreSalesRepresentative
                        )
                      }
                    />
                  )}
                </>
              )}
              {!!salesRepresentative?.length && !!salesAdmin?.length && <br />}
              {!!salesAdmin?.length && (
                <>
                  <span className="b">
                    {formatMessage(messages.salesAdmin)}
                  </span>{' '}
                  {showMoreSalesAdmin
                    ? salesAdmin.join(', ')
                    : salesAdmin.slice(0, MAX_SALES_USERS_TO_SHOW).join(', ')}
                  {salesAdmin.length > MAX_SALES_USERS_TO_SHOW && (
                    <ShowMoreButton
                      isExpanded={showMoreSalesAdmin}
                      onClick={() => setShowMoreSalesAdmin(!showMoreSalesAdmin)}
                    />
                  )}
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
        <div className="t-mini mt3">{email}</div>
        {phone && phone !== '+10000000000' && (
          <div className="t-mini mt1">{phone}</div>
        )}
        {representativeBalanceEnabled && (
          <div className="mt4">
            <RepresentativeBalanceData />
          </div>
        )}
      </>
    ),
  })

  contactFields.push({
    label: `${formatMessage(messages.costCentersLabel)} / ${formatMessage(
      messages.shippingAddress
    )}`,
    value: <CostCentersShipping />,
  })

  contactFields.push({
    label: formatMessage(messages.billingAddress),
    value: <BillingAddress />,
  })

  return (
    <div className="mb4">
      <Totalizer items={contactFields} />
    </div>
  )
}
