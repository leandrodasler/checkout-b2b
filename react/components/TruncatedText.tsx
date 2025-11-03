import React from 'react'
import { Tooltip } from 'vtex.styleguide'

type Props = {
  text?: React.ReactNode | null
  label?: React.ReactNode | null
  strike?: boolean
  inline?: boolean
}

export function TruncatedText({ text, label = text, strike, inline }: Props) {
  const children = (
    <div
      className={`truncate${!inline ? ' w-100' : ''}${strike ? ' strike' : ''}`}
    >
      {text}
    </div>
  )

  if (!label) return children

  return <Tooltip label={label}>{children}</Tooltip>
}
