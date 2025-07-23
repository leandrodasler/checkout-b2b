import React from 'react'
import { TranslateEstimate } from 'vtex.shipping-estimate-translator'
import { ShippingSla } from 'vtex.store-graphql'

type Props = {
  sla?: ShippingSla | null
  highlightName?: boolean
  price?: string
  isSmall?: boolean
}

export function Sla({ sla, highlightName, price, isSmall }: Props) {
  if (!sla) return null

  return (
    <div className="flex items-center">
      <span
        className={`${!highlightName ? 'c-muted-1' : ''} ${
          isSmall ? 't-small' : ''
        }`}
      >
        {highlightName ? (
          <span className="b c-muted-1">{sla.name}</span>
        ) : (
          sla.name
        )}
        {!!price && ` - ${price}`}
        <br />
        <TranslateEstimate shippingEstimate={sla.shippingEstimate} />
      </span>
    </div>
  )
}
