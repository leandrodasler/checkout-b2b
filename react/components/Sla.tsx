import React from 'react'
import { TranslateEstimate } from 'vtex.shipping-estimate-translator'
import { ShippingSla } from 'vtex.store-graphql'

type Props = {
  sla?: ShippingSla | null
  highlightName?: boolean
  price?: string
}

export function Sla({ sla, highlightName, price }: Props) {
  if (!sla) return null

  return (
    <div className="flex items-center">
      <span>
        {highlightName ? (
          <span className="b c-muted-1">{sla.name}</span>
        ) : (
          sla.name
        )}
        {!!price && ` - ${price}`}
        <br />
        <TranslateEstimate shippingEstimate={sla.shippingEstimate} />{' '}
      </span>
    </div>
  )
}
