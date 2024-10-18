import React from 'react'
import { Tooltip } from 'vtex.styleguide'

type Props = {
  text?: React.ReactNode | null
  label?: React.ReactNode | null
}

export function TruncatedText({ text, label = text }: Props) {
  return (
    <Tooltip label={label}>
      <div className="truncate">{text}</div>
    </Tooltip>
  )
}
