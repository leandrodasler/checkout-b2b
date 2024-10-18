import React from 'react'
import { useIntl } from 'react-intl'
import { Organization } from 'vtex.b2b-organizations-graphql'
import { Totalizer } from 'vtex.styleguide'

import { useOrderFormCustom } from '../hooks'
import { messages } from '../utils'
import { TruncatedText } from './TruncatedText'

type Props = {
  organization?: Organization | null
}

export function ContactInfos({ organization }: Props) {
  const { formatMessage } = useIntl()
  const {
    orderForm: { clientProfileData, shipping },
  } = useOrderFormCustom()

  if (!organization || !clientProfileData) return null

  let formattedAddress = formatMessage(messages.emptyAddress)

  if (shipping?.selectedAddress) {
    const { street, number, city, state } = shipping?.selectedAddress

    formattedAddress = `${street}${
      number ? `, ${number}` : ''
    } - ${city}, ${state}`
  }

  const contactFields = [
    {
      label: formatMessage(messages.companyName),
      value: (
        <TruncatedText
          text={(organization.tradeName ?? '') || organization.name}
        />
      ),
    },
    {
      label: formatMessage(messages.buyerName),
      value: (
        <TruncatedText
          text={`${clientProfileData?.firstName} ${
            clientProfileData?.lastName ?? ''
          }`}
        />
      ),
    },
    {
      label: formatMessage(messages.email),
      value: <TruncatedText text={clientProfileData?.email} />,
    },
    {
      label: formatMessage(messages.selectedAddress),
      value: <TruncatedText text={formattedAddress} />,
    },
  ]

  return (
    <div className="mb4">
      <Totalizer items={contactFields} />
    </div>
  )
}
