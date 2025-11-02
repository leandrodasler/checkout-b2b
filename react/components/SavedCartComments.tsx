import React, { Fragment, useRef, useState } from 'react'
import { useMutation, useQuery } from 'react-apollo'
import { useIntl } from 'react-intl'
import type {
  CartComment,
  Maybe,
  Mutation,
  MutationCreateCartCommentArgs,
  Query,
  QueryGetCartCommentsArgs,
  SavedCart,
  SavedCartStatus,
} from 'ssesandbox04.checkout-b2b'
import { useCssHandles } from 'vtex.css-handles'
import { useRuntime } from 'vtex.render-runtime'
import {
  Button,
  Card,
  IconCaretRight,
  Spinner,
  Tag,
  Textarea,
} from 'vtex.styleguide'

import { useCheckoutB2BContext } from '../CheckoutB2BContext'
import CREATE_CART_COMMENT from '../graphql/createCartComment.graphql'
import GET_CART_COMMENTS from '../graphql/getCartComments.graphql'
import { useToast } from '../hooks'
import { CART_STATUSES, messages, POLL_INTERVAL } from '../utils'
import { GET_CHILDREN_CARTS } from './ChildrenCartsColumn'
import { SavedCartDiscountBadge } from './SavedCartDiscountBadge'
import { SavedCartStatusBadge } from './SavedCartStatusBadge'

type QueryGetCartComments = Pick<Query, 'getCartComments'>
type CreateCartCommentMutation = Pick<Mutation, 'createCartComment'>

type Props = {
  cart: SavedCart
  isModal: boolean
  setQuantity: React.Dispatch<React.SetStateAction<number>>
}

export function SavedCartComments({ cart, isModal, setQuantity }: Props) {
  const handles = useCssHandles(['container'])
  const { locale } = useRuntime().culture
  const { formatMessage } = useIntl()
  const showToast = useToast()
  const [inputComment, setInputComment] = useState('')
  const commentsRef = useRef<HTMLDivElement>(null)
  const { selectedCart, refetchCurrentSavedCart } = useCheckoutB2BContext()

  const { data, networkStatus } = useQuery<
    QueryGetCartComments,
    QueryGetCartCommentsArgs
  >(GET_CART_COMMENTS, {
    variables: { savedCartId: cart.id },
    fetchPolicy: 'cache-and-network',
    pollInterval: POLL_INTERVAL,
    onError: showToast,
    onCompleted({ getCartComments }) {
      setQuantity(getCartComments.length)
    },
  })

  const [addComment, { loading: addCommentLoading }] = useMutation<
    CreateCartCommentMutation,
    MutationCreateCartCommentArgs
  >(CREATE_CART_COMMENT, {
    refetchQueries: [
      { query: GET_CART_COMMENTS, variables: { savedCartId: cart.id } },
      ...(isModal ? ['getSavedCarts', 'getAllSavedCarts'] : []),
      ...(isModal && cart.parentCartId
        ? [
            {
              query: GET_CHILDREN_CARTS,
              variables: { parentCartId: cart.parentCartId },
            },
          ]
        : []),
    ],
    awaitRefetchQueries: true,
    onError: showToast,
    onCompleted() {
      setInputComment('')

      if (selectedCart?.id === cart.id) {
        refetchCurrentSavedCart()
      }
    },
  })

  const handleAddComment = () => {
    addComment({
      variables: { comment: inputComment.trim(), savedCartId: cart.id },
    })
  }

  return (
    <div className={handles.container} style={{ minHeight: '30vh' }}>
      <h5 className="t-heading-5 mb3 mt0">{cart.title}</h5>
      <div className="flex flex-wrap">
        <SavedCartStatusBadge status={cart.status} />
        <SavedCartDiscountBadge discount={cart.requestedDiscount} />
        <Tag size="small" variation="low">
          {cart.roleId}
        </Tag>
      </div>
      <div
        className="flex flex-column-reverse items-center mt6 pa6 b--muted-3 bt bb overflow-auto t-small"
        style={{ maxHeight: 450, gap: '1rem' }}
        ref={commentsRef}
      >
        {networkStatus === 1 ? (
          <Spinner />
        ) : !data?.getCartComments.length ? (
          <span className="c-muted-2">
            {formatMessage(messages.savedCartsEmptyUpdateHistory)}
          </span>
        ) : (
          data?.getCartComments.map((comment: Maybe<CartComment>) => (
            <Card key={comment?.id}>
              {comment?.comment
                .split(/\s+/g)
                .map((term: string, index: number) => {
                  if (term === '>') {
                    return (
                      <span key={index} className="mh2">
                        <IconCaretRight size={12} />
                      </span>
                    )
                  }

                  if (
                    comment?.comment.startsWith('Status:') &&
                    Object.values(
                      CART_STATUSES as Record<string, string>
                    ).includes(term.replace('.', ''))
                  ) {
                    return (
                      <span key={index} className="mh2">
                        <SavedCartStatusBadge
                          status={term.replace('.', '') as SavedCartStatus}
                        />
                      </span>
                    )
                  }

                  return <Fragment key={index}>{term} </Fragment>
                })}

              <div className="mt4 flex flex-wrap justify-between">
                {comment?.createdIn && (
                  <span className="c-action-primary">
                    {new Date(comment.createdIn).toLocaleString(locale)}
                  </span>
                )}
                <span className="c-action-primary">{comment?.email}</span>
              </div>
            </Card>
          ))
        )}
      </div>
      <div className="mt6">
        <Textarea
          label=""
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
            setInputComment(e.target.value)
          }}
          value={inputComment}
          disabled={addCommentLoading}
        />
      </div>
      <div className="flex justify-end mt3">
        <Button
          onClick={handleAddComment}
          isLoading={addCommentLoading}
          disabled={!inputComment.trim()}
        >
          {formatMessage(messages.savedCartsAddUpdateHistory)}
        </Button>
      </div>
    </div>
  )
}
