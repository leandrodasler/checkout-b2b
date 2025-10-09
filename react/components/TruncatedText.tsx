import React from 'react'
import { Tooltip } from 'vtex.styleguide'

type Props = {
  text?: React.ReactNode | null
  label?: React.ReactNode | null
  strike?: boolean
  inline?: boolean
}

export function TruncatedText({ text, label = text, strike, inline }: Props) {
  return (
    <Tooltip label={label}>
      <div
        className={`truncate${!inline ? ' w-100' : ''}${
          strike ? ' strike' : ''
        }`}
      >
        {text}
      </div>
    </Tooltip>
  )
}
