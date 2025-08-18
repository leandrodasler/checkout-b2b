import React from 'react'
import { useIntl } from 'react-intl'
import { ButtonPlain } from 'vtex.styleguide'

import { messages } from '../utils'

type Props = {
  isExpanded: boolean
  onClick: () => void
}

export function ShowMoreButton({ isExpanded, onClick }: Props) {
  const { formatMessage } = useIntl()
  const showLessLabel = formatMessage(messages.showLess)
  const showMoreLabel = formatMessage(messages.showMore)

  return (
    <span className="ml2" data-pdf-click={!isExpanded || undefined}>
      <ButtonPlain size="small" onClick={onClick}>
        <span className="t-mini">
          {isExpanded ? showLessLabel : showMoreLabel}
        </span>
      </ButtonPlain>
    </span>
  )
}
