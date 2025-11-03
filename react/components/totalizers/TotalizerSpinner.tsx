import React from 'react'
import { Spinner } from 'vtex.styleguide'

type Props = { size?: number }

export function TotalizerSpinner({ size = 32 }: Props) {
  return (
    <div className="flex justify-center w-100">
      <Spinner size={size} />
    </div>
  )
}
