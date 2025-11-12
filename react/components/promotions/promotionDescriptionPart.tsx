import React from 'react'
import { Progress } from 'vtex.styleguide'

import { DescriptionPart } from './usePromotions'

type Props = {
  descriptionPart: DescriptionPart
}

export function PromotionDescriptionPart({ descriptionPart }: Props) {
  const { text } = descriptionPart

  if (descriptionPart.type === 'warning') {
    return <div className="t-mini ma0">* {text}</div>
  }

  if (descriptionPart.type === 'success') {
    return (
      <div className="flex flex-column flex-wrap tc ma0">
        <span>100%</span>
        <Progress percent={100} type="line" />
        <span className="c-success">{text}</span>
      </div>
    )
  }

  if (descriptionPart.type === 'target') {
    return (
      <div className="flex flex-column tc ma0">
        <span>{descriptionPart.percent}%</span>
        <Progress percent={descriptionPart.percent} type="line" />
        <span className="mt2">{text}</span>
      </div>
    )
  }

  return <div className="ma0">{text}</div>
}
