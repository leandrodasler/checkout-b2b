import React from 'react'
import { ButtonPlain } from 'vtex.styleguide'

type Props = {
  isExpanded: boolean
  onClick: () => void
}

export function ShowMoreButton({ isExpanded, onClick }: Props) {
  return (
    <span className="ml2">
      <ButtonPlain size="small" onClick={onClick}>
        <span className="t-mini">
          {isExpanded ? 'Mostrar menos' : 'Mostrar mais'}
        </span>
      </ButtonPlain>
    </span>
  )
}
