import React from 'react'
import { useIntl } from 'react-intl'
import { Totalizer } from 'vtex.styleguide'

import { useOrderFormCustom } from '../hooks'
import type { CustomOrganization } from '../typings'
import { messages } from '../utils'
import { Address } from './Address'
import { ShippingOption } from './ShippingOption'
import { TruncatedText } from './TruncatedText'

type Props = {
  organization?: CustomOrganization
}

export function ContactInfos({ organization }: Props) {
  const { formatMessage } = useIntl()
  const {
    orderForm: { clientProfileData, items },
  } = useOrderFormCustom()

  if (!clientProfileData) return null

  const {
    firstName,
    lastName,
    email,
    corporatePhone,
    phone,
  } = clientProfileData

  const contactFields: Array<{ label: string; value: React.ReactNode }> = []

  if (organization?.users) {
    const getUsersByRole = (role: string) =>
      organization.users
        ?.filter((user) => user?.roleId === role)
        .map((user) => user?.name)
        .join(', ') ?? 'N/A'

    contactFields.push({
      label: formatMessage(messages.companyName),
      value: (
        <>
          <TruncatedText text={organization.tradeName ?? organization.name} />
          <span className="t-mini">
            <span className="b">
              {formatMessage(messages.salesRepresentative)},
            </span>
            {getUsersByRole('sales-representative')}
            <br />
            <span className="b">
              {formatMessage(messages.salesRepresentative)}
            </span>
            {getUsersByRole('sales-admin')}
          </span>
        </>
      ),
    })
  }

  contactFields.push({
    label: formatMessage(messages.buyerName),
    value: (
      <TruncatedText
        text={
          <>
            {firstName} {lastName}
            <br />
            <span className="t-mini">{email}</span>
            {(corporatePhone || phone) && (
              <>
                <br />
                <span className="t-mini">
                  {corporatePhone ? `${corporatePhone} / ` : ''}
                  {phone}
                </span>
              </>
            )}
          </>
        }
      />
    ),
  })

  contactFields.push({
    label: formatMessage(messages.shippingAddress),
    value: <TruncatedText text={<Address />} />,
  })

  if (items.length) {
    contactFields.push({
      label: formatMessage(messages.shippingOption),
      value: <ShippingOption />,
    })
  }

  return (
    <div className="mb4">
      <Totalizer items={contactFields} />
    </div>
  )
}
