import React, { useEffect, useMemo } from 'react'
import { useMutation } from 'react-apollo'
import { useIntl } from 'react-intl'
import type {
  UpdateOrderFormProfileMutation,
  UpdateOrderFormProfileMutationVariables,
} from 'vtex.checkout-resources'
import { MutationUpdateOrderFormProfile } from 'vtex.checkout-resources'
import { Tag, Totalizer } from 'vtex.styleguide'

import {
  useOrderFormCustom,
  useOrganization,
  usePermissions,
} from '../../hooks'
import { messages } from '../../utils'
import { BillingAddress } from '../delivery/BillingAddress'
import { CostCentersShipping } from '../delivery/CostCentersShipping'
import { RepresentativeBalanceData } from '../representative-balance/RepresentativeBalanceData'
import { RepresentativeUsers } from './RepresentativeUsers'

type Props = {
  onChangeItems: () => void
}

export function ContactInfos({ onChangeItems }: Props) {
  const { formatMessage } = useIntl()
  const { organization } = useOrganization()
  const {
    orderForm: { clientProfileData },
  } = useOrderFormCustom()

  const { representativeBalanceEnabled } = usePermissions()
  const { costCenter, tradeName, name, roleName, users } = organization
  const costCenterPhone = costCenter?.phoneNumber ?? ''
  const clientProfilePhone = clientProfileData?.phone
  const currentOrganizationUser = users?.find(
    (user) => user?.email === clientProfileData.email
  )

  const [currentOrganizationUserFirstName, ...restOfOrganizationUserName] =
    currentOrganizationUser?.name?.split(/\s+/) ?? []

  const currentOrganizationUserLastName = restOfOrganizationUserName.join(' ')

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
    if (
      !clientProfileData ||
      (clientProfileData?.tradeName &&
        clientProfileData?.firstName === currentOrganizationUserFirstName &&
        clientProfileData?.lastName === currentOrganizationUserLastName)
    )
      return

    const {
      corporatePhone,
      profileCompleteOnLoading,
      profileErrorOnLoading,
      customerClass,
      isValid,
      ...inputProfileData
    } = clientProfileData

    updateProfile({
      variables: {
        profile: {
          ...inputProfileData,
          firstName: currentOrganizationUserFirstName,
          lastName: currentOrganizationUserLastName,
          tradeName: organizationName,
        },
      },
    })
  }, [
    clientProfileData,
    currentOrganizationUserLastName,
    currentOrganizationUserFirstName,
    organizationName,
    phone,
    updateProfile,
  ])

  if (!clientProfileData) return null

  const { firstName, lastName, email } = clientProfileData

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
          <RepresentativeUsers
            b2bRole="sales-representative"
            title={formatMessage(messages.salesRepresentative)}
          />
          <RepresentativeUsers
            b2bRole="sales-admin"
            title={formatMessage(messages.salesAdmin)}
          />
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
            {(firstName ?? '') || currentOrganizationUserFirstName}{' '}
            {(lastName ?? '') || currentOrganizationUserLastName}
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
    value: <CostCentersShipping onChangeItems={onChangeItems} />,
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
