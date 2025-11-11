import React from 'react'
import { Progress } from 'vtex.styleguide'

import { DescriptionPart } from './usePromotions'

type Props = {
  descriptionPart: DescriptionPart
}

export function PromotionDescriptionPart({ descriptionPart }: Props) {
  const { text } = descriptionPart

  if (descriptionPart.type === 'warning') {
    return <p className="t-mini ma0">* {text}</p>
  }

  if (descriptionPart.type === 'success') {
    return (
      <p className="flex flex-column flex-wrap tc ma0">
        <span className="t-small">100%</span>
        <Progress percent={100} type="line" />
        <span className="t-small c-success">{text}</span>
      </p>
    )
  }

  if (descriptionPart.type === 'target') {
    return (
      <p className="flex flex-column tc ma0">
        <span className="t-small">{descriptionPart.percent}%</span>
        <Progress percent={descriptionPart.percent} type="line" />
        <span className="t-small mt2">{text}</span>
      </p>
    )
  }

  return <p className="ma0">{text}</p>
}
