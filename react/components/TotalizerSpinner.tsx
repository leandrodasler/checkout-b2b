import React from 'react'
import { Spinner } from 'vtex.styleguide'

export function TotalizerSpinner() {
  return (
    <div className="flex justify-center">
      <Spinner size={32} />
    </div>
  )
}
