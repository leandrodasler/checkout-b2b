import React, { useEffect, useRef, useState } from 'react'
import { useCssHandles } from 'vtex.css-handles'
import {
  ButtonWithIcon,
  Card,
  IconCaretLeft,
  IconCaretRight,
} from 'vtex.styleguide'

import { PromotionDescriptionPart } from './promotionDescriptionPart'
import { usePromotions } from './usePromotions'

const OFFSET_SCROLL = 316

export function Promotions() {
  const handles = useCssHandles([
    'promotionsContainer',
    'promotionCard',
    'promotionDescriptionContainer',
  ] as const)

  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollStatus, setScrollStatus] = useState<
    'hidden' | 'start' | 'middle' | 'end'
  >('hidden')

  const getContainerWidth = () =>
    Math.round(containerRef.current?.clientWidth ?? 0)

  const getContainerScrollLeft = () =>
    Math.round(containerRef.current?.scrollLeft ?? 0)

  const getContainerScrollWidth = () =>
    Math.round(containerRef.current?.scrollWidth ?? 0)

  const handleScrollStatus = (containerScrollLeft: number) => {
    const containerWidth = getContainerWidth()
    const containerScrollWidth = getContainerScrollWidth()

    if (containerScrollWidth <= containerWidth) {
      setScrollStatus('hidden')

      return
    }

    if (containerScrollLeft === 0) {
      setScrollStatus('start')
    }

    if (
      containerScrollLeft > 0 &&
      containerScrollLeft < containerScrollWidth - containerWidth
    ) {
      setScrollStatus('middle')
    }

    if (
      containerScrollLeft > 0 &&
      containerScrollLeft >= containerScrollWidth - containerWidth
    ) {
      setScrollStatus('end')
    }
  }

  const handleInitialScroll = useRef(() =>
    handleScrollStatus(getContainerScrollLeft())
  )

  const { promotions, loading } = usePromotions()

  useEffect(() => {
    if (!loading && promotions.length) {
      handleInitialScroll.current()
    }
  }, [loading, promotions.length])

  useEffect(() => {
    const resizeListener = handleInitialScroll.current

    window.addEventListener('resize', resizeListener)

    return () => window.removeEventListener('resize', resizeListener)
  }, [])

  if (!promotions.length || loading) return null

  const handleScrollLeft = () => {
    if (!containerRef.current) return

    const containerScrollLeft = getContainerScrollLeft()
    const newContainerScrollLeft =
      containerScrollLeft >= OFFSET_SCROLL
        ? containerScrollLeft - OFFSET_SCROLL
        : 0

    containerRef.current.scrollLeft = newContainerScrollLeft

    handleScrollStatus(newContainerScrollLeft)
  }

  const handleScrollRight = () => {
    if (!containerRef.current) return

    const containerWidth = getContainerWidth()
    const containerScrollLeft = getContainerScrollLeft()
    const containerScrollWidth = getContainerScrollWidth()
    const newContainerScrollLeft =
      containerScrollLeft < containerScrollWidth - containerWidth
        ? containerScrollLeft + OFFSET_SCROLL
        : containerScrollWidth - OFFSET_SCROLL

    containerRef.current.scrollLeft = newContainerScrollLeft

    handleScrollStatus(newContainerScrollLeft)
  }

  return (
    <>
      <h3 className="t-heading-4 mt0 tc">Promoções disponíveis na loja</h3>
      <div className="flex mb4 items-center justify-center">
        {scrollStatus !== 'hidden' && (
          <ButtonWithIcon
            disabled={scrollStatus === 'start'}
            onClick={handleScrollLeft}
            icon={<IconCaretLeft />}
          />
        )}
        <div
          ref={containerRef}
          className={`${handles.promotionsContainer} flex items-stretch overflow-hidden`}
        >
          {promotions.map((promotion) => (
            <div key={promotion.id} className={handles.promotionCard}>
              <Card>
                <span className="mt0 mb6 b tc t-action--large">
                  {promotion.title}
                </span>
                {!!promotion.descriptionParts?.length && (
                  <div
                    className={`${handles.promotionDescriptionContainer} flex flex-column t-small`}
                  >
                    {promotion.descriptionParts.map((description, index) => (
                      <PromotionDescriptionPart
                        key={index}
                        descriptionPart={description}
                      />
                    ))}
                  </div>
                )}
              </Card>
            </div>
          ))}
        </div>
        {scrollStatus !== 'hidden' && (
          <ButtonWithIcon
            disabled={scrollStatus === 'end'}
            onClick={handleScrollRight}
            icon={<IconCaretRight />}
          />
        )}
      </div>
    </>
  )
}
