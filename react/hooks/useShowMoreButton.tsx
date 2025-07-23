import React, { useState } from 'react'
import { ButtonPlain } from 'vtex.styleguide'

export function useShowMoreButton() {
  const [isExpanded, setIsExpanded] = useState(false)
  const onClick = () => setIsExpanded(!isExpanded)

  return [
    isExpanded,
    <span className="ml2" key="show-more-button">
      <ButtonPlain size="small" onClick={onClick}>
        <span className="t-mini">
          {isExpanded ? 'Mostrar menos' : 'Mostrar mais'}
        </span>
      </ButtonPlain>
    </span>,
  ] as const
}
