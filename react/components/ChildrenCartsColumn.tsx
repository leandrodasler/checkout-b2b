import React, { useCallback, useEffect } from 'react'
import { useLazyQuery } from 'react-apollo'
import { QueryGetSavedCartsArgs, SavedCart } from 'ssesandbox04.checkout-b2b'
import { ButtonPlain, IconCaretDown, IconCaretRight } from 'vtex.styleguide'

import { useCheckoutB2BContext } from '../CheckoutB2BContext'
import GET_CHILDREN_CARTS from '../graphql/getSavedCarts.graphql'
import { GetSavedCartsQuery } from '../typings'

type ChildrenCartsColumnProps = {
  cart: SavedCart
  expandedCarts: string[]
  setExpandedCarts: React.Dispatch<React.SetStateAction<string[]>>
  childrenCarts: Record<string, SavedCart[]>
  setChildrenCarts: React.Dispatch<
    React.SetStateAction<Record<string, SavedCart[]>>
  >
}

export default function ChildrenCartsColumn({
  cart,
  expandedCarts,
  setExpandedCarts,
  childrenCarts,
  setChildrenCarts,
}: ChildrenCartsColumnProps) {
  const { childrenQuantity, id } = cart
  const { selectedCart } = useCheckoutB2BContext()

  const [fetchChildrenCarts] = useLazyQuery<
    GetSavedCartsQuery,
    QueryGetSavedCartsArgs
  >(GET_CHILDREN_CARTS, {
    ssr: false,
    fetchPolicy: 'cache-and-network',
    variables: { parentCartId: id },
    onCompleted({ getSavedCarts }) {
      const [firstChild] = getSavedCarts
      const { parentCartId } = firstChild
      const currentChildrenCarts = childrenCarts[parentCartId ?? '']

      if (parentCartId && !currentChildrenCarts) {
        setChildrenCarts((prev) => ({
          ...prev,
          [parentCartId]: getSavedCarts,
        }))
      }
    },
  })

  const handleExpand = useCallback(() => {
    setExpandedCarts((prev) => [...prev, id])
    fetchChildrenCarts({ variables: { parentCartId: id } })
  }, [fetchChildrenCarts, id, setExpandedCarts])

  const handleCollapse = useCallback(() => {
    setExpandedCarts((prev) => prev.filter((i) => i !== id))
  }, [id, setExpandedCarts])

  useEffect(() => {
    if (selectedCart?.parentCartId === id && !childrenCarts[id]?.length) {
      handleExpand()
    }
  }, [childrenCarts, handleExpand, id, selectedCart?.parentCartId])

  if (!childrenQuantity) return null

  if (expandedCarts.includes(id)) {
    return (
      <ButtonCollapseWrapper>
        <ButtonPlain onClick={handleCollapse}>
          <IconCaretDown size={10} />
        </ButtonPlain>
      </ButtonCollapseWrapper>
    )
  }

  return (
    <ButtonCollapseWrapper>
      <ButtonPlain onClick={handleExpand}>
        <IconCaretRight size={10} />
      </ButtonPlain>
    </ButtonCollapseWrapper>
  )
}

function ButtonCollapseWrapper({ children }: React.PropsWithChildren<unknown>) {
  return (
    <div className="absolute flex items-center pointer w-100 h-100 left-0">
      {children}
    </div>
  )
}
