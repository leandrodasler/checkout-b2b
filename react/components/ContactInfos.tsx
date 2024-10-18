import React from 'react'
import { useIntl } from 'react-intl'
import { Organization } from 'vtex.b2b-organizations-graphql'
import { Totalizer } from 'vtex.styleguide'

import { useOrderFormCustom } from '../hooks'
import { messages } from '../utils'

type Props = {
  organization?: Organization | null
}

export function ContactInfos({ organization }: Props) {
  const { formatMessage } = useIntl()
  const {
    orderForm: { clientProfileData },
  } = useOrderFormCustom()

  if (!organization || !clientProfileData) return null

  const contactFields = [
    {
      label: formatMessage(messages.companyName),
      value: organization.tradeName,
    },
    {
      label: formatMessage(messages.buyerName),
      value: `${clientProfileData?.firstName} ${clientProfileData?.lastName}`,
    },
    { label: formatMessage(messages.phone), value: clientProfileData?.phone },
    { label: formatMessage(messages.email), value: clientProfileData?.email },
  ]

  return (
    <div className="mb4">
      <Totalizer items={contactFields} />
    </div>
  )
}
