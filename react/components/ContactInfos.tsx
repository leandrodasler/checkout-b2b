import React from 'react'
import { useIntl } from 'react-intl'
import type { OrderForm } from 'vtex.checkout-graphql'
import { Totalizer } from 'vtex.styleguide'

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
  ].filter((field) => field.value)

  return (
    <div className="mb4">
      {contactFields.length && <Totalizer items={contactFields} isLoading />}
    </div>
  )
}
