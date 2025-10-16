import React from 'react'
import { Tag } from 'vtex.styleguide'

type Props = { discount?: number | null }

export function SavedCartDiscountBadge({ discount }: Props) {
  if (!discount) return null

  return (
    <Tag size="small" type={discount < 0 ? 'success' : 'error'}>
      {discount < 0 && '+'}
      {discount * -1}%
    </Tag>
  )
}
