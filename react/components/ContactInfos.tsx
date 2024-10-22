import React from 'react'
import { useIntl } from 'react-intl'
import { Organization } from 'vtex.b2b-organizations-graphql'
import { Totalizer } from 'vtex.styleguide'

import { useOrderFormCustom } from '../hooks'
import { messages } from '../utils'
import { Address } from './Address'
import { ShippingOption } from './ShippingOption'
import { TruncatedText } from './TruncatedText'

type Props = {
  organization?: Organization | null
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

  if (organization) {
    contactFields.push({
      label: formatMessage(messages.companyName),
      value: (
        <TruncatedText
          text={(organization.tradeName ?? '') || organization.name}
        />
      ),
    })
  }

  contactFields.push({
    label: formatMessage(messages.buyerName),
    value: (
      <TruncatedText
        text={
          <>
            {firstName} {lastName ?? ''}
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
