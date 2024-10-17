import React from 'react'
import { useIntl } from 'react-intl'
import type { OrderForm } from 'vtex.checkout-graphql'

import { messages } from '../utils'

export function ContactInfos({
  clientProfileData,
}: {
  clientProfileData?: OrderForm['clientProfileData']
}) {
  const { formatMessage } = useIntl()
  const contactFields = [
    {
      label: formatMessage(messages.companyName),
      value: clientProfileData?.corporateName,
    },
    {
      label: formatMessage(messages.buyerName),
      value: `${clientProfileData?.firstName} ${clientProfileData?.lastName}`,
    },
    { label: formatMessage(messages.phone), value: clientProfileData?.phone },
    { label: formatMessage(messages.email), value: clientProfileData?.email },
  ]

  return (
    <div>
      {contactFields.map(
        (field) =>
          field.value && (
            <div key={field.label}>
              <p className="t-action mw9">{field.label}:</p>
              <p className="t-small mw9">{field.value}</p>
            </div>
          )
      )}
    </div>
  )
}
