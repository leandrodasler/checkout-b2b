import React from 'react'
import { ButtonPlain, IconCaretDown, IconCaretRight } from 'vtex.styleguide'

type Props = {
  isParent?: boolean
  productId: string
  expandedProducts: string[]
  setExpandedProducts: React.Dispatch<React.SetStateAction<string[]>>
}

export default function ChildrenProductsColumn({
  isParent = false,
  productId,
  expandedProducts,
  setExpandedProducts,
}: Props) {
  if (!isParent) {
    return <React.Fragment />
  }

  const isExpanded = expandedProducts.includes(productId)

  const toggleExpand = () => {
    setExpandedProducts((prev) =>
      isExpanded ? prev.filter((id) => id !== productId) : [...prev, productId]
    )
  }

  return (
    <div className="absolute flex items-center pointer w-100 h-100 left-0 z-1">
      <ButtonPlain onClick={toggleExpand}>
        {isExpanded ? (
          <IconCaretDown size={10} />
        ) : (
          <IconCaretRight size={10} />
        )}
      </ButtonPlain>
    </div>
  )
}
