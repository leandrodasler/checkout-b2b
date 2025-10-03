import React from 'react'
import { Tooltip } from 'vtex.styleguide'

type Props = {
  text?: React.ReactNode | null
  label?: React.ReactNode | null
  strike?: boolean
}

export function TruncatedText({ text, label = text, strike = false }: Props) {
  return (
    <Tooltip label={label}>
      <div className={`truncate w-100${strike ? ' strike' : ''}`}>{text}</div>
    </Tooltip>
  )
}
