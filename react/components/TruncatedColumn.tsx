import React from 'react'
import { Tooltip } from 'vtex.styleguide'

type Props = {
  text: string
  label?: string
}

export function TruncatedColumn({ text, label = text }: Props) {
  return (
    <Tooltip label={label}>
      <span className="truncate">{text}</span>
    </Tooltip>
  )
}
