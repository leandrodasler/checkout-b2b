import React from 'react'

type Props = {
  size?: number
  color?: string
  quantity?: number
}

export function IconUpdateHistory({
  size = 18,
  color = 'currentColor',
  quantity = 0,
}: Props) {
  const shouldRenderBadge = typeof quantity === 'number'
  const badgeText = quantity > 9 ? '9+' : quantity
  const badgeCenterX = 16
  const badgeCenterY = 16
  const badgeRadius = 8
  const fontSize = 12

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M21 15C21 16.1046 20.1046 17 19 17H8.5L3 21V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V15Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 8H17"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 12H13"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {shouldRenderBadge && (
        <g>
          <circle
            cx={badgeCenterX}
            cy={badgeCenterY}
            r={badgeRadius}
            fill="#FF0000"
            stroke="white"
            strokeWidth="1"
          />
          <text
            x={badgeCenterX}
            y={badgeCenterY}
            fontSize={fontSize}
            fill="white"
            textAnchor="middle"
            dominantBaseline="central"
            fontWeight="bold"
          >
            {badgeText}
          </text>
        </g>
      )}
    </svg>
  )
}
