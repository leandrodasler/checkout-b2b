import React, { useCallback, useRef } from 'react'
import { useIntl } from 'react-intl'
import { SavedCart, SavedCartStatus } from 'ssesandbox04.checkout-b2b'
import { FormattedPrice } from 'vtex.formatted-price'
import {
  ButtonPlain,
  ButtonWithIcon,
  Card,
  IconShoppingCart,
  Tag,
  Tooltip,
} from 'vtex.styleguide'

import { useCheckoutB2BContext } from '../CheckoutB2BContext'
import { useSavedCart } from '../hooks'
import { messages } from '../utils/messages'
import { SavedCartDiscountBadge } from './SavedCartDiscountBadge'

interface DiscountApprovalKanbanProps {
  requests?: SavedCart[]
  onChangeCartStatus: (id: string, status: SavedCartStatus) => void
  isLoadingChangeCartStatus: boolean
  onUseCart: () => void
}

interface CartData {
  value: number
}

export function DiscountApprovalKanban({
  requests = [],
  onChangeCartStatus,
  isLoadingChangeCartStatus,
  onUseCart,
}: DiscountApprovalKanbanProps) {
  const { formatMessage } = useIntl()
  const { selectedCart } = useCheckoutB2BContext()
  const { handleUseSavedCart, loading } = useSavedCart()

  const columns = [
    { key: 'open', label: formatMessage(messages.discountStatusOpen) },
    { key: 'pending', label: formatMessage(messages.discountStatusPending) },
    { key: 'approved', label: formatMessage(messages.discountStatusApproved) },
    { key: 'denied', label: formatMessage(messages.discountStatusDenied) },
    {
      key: 'orderPlaced',
      label: formatMessage(messages.discountStatusOrderApproved),
    },
  ]

  const groupedRequests = columns.reduce((acc, col) => {
    acc[col.key] = requests?.filter((r) => r.status === col.key)

    return acc
  }, {} as Record<string, typeof requests>)

  const parseCartData: (savedCartData: string) => CartData = useCallback(
    (savedCartData: string) => {
      return JSON.parse(savedCartData) || ({} as CartData)
    },
    []
  )

  const currentUpdateId = useRef('')
  const currentUpdateStatus = useRef<SavedCartStatus>()

  const handleChangeCartStatus = (
    id: string,
    status: SavedCartStatus
  ) => () => {
    currentUpdateId.current = id
    currentUpdateStatus.current = status
    onChangeCartStatus(id, status)
  }

  const isLoading = (id: string, status: SavedCartStatus) =>
    isLoadingChangeCartStatus &&
    currentUpdateId.current === id &&
    currentUpdateStatus.current === status

  return (
    <div className="flex flex-row justify-between overflow-x-auto pa2">
      {columns.map((col) => (
        <div
          key={col.key}
          className="flex flex-column mh3 bg-muted-5 br3 flex-grow-1"
          style={{ maxWidth: '300px' }}
        >
          <div
            className="mt4 mh5 c-action-primary br3 b flex items-center justify-between"
            style={{ gap: 6 }}
          >
            <span>{col.label}</span>
            <Tag>{groupedRequests[col.key].length}</Tag>
          </div>

          <div
            className="flex flex-column mt3 pa3 overflow-auto"
            style={{
              maxHeight: '520px',
              gap: '6px',
            }}
          >
            {groupedRequests[col.key].length === 0 && (
              <span className="c-muted-2 ph4 pt2">
                {formatMessage(messages.noRequests)}
              </span>
            )}

            {groupedRequests[col.key].map((req) => {
              const isCurrent = selectedCart?.id === req.id
              const tooltipLabel = isCurrent
                ? formatMessage(messages.savedCartsInUseLabel)
                : formatMessage(messages.savedCartsSelectLabel)

              return (
                <div key={req.id} className="relative">
                  <Card noPadding>
                    <div
                      className={`flex flex-column pa6 br2${
                        isCurrent ? ' bg-success--faded' : ''
                      }`}
                      style={{ gap: 6 }}
                    >
                      <div className="flex justify-between items-center">
                        <div className="c-muted-1">
                          <span className="t-mini">
                            {new Date(req.createdIn).toLocaleString()}
                          </span>
                        </div>
                        <Tooltip label={tooltipLabel}>
                          <div className="absolute right-1 top-1">
                            <ButtonWithIcon
                              size="small"
                              variation="tertiary"
                              icon={<IconShoppingCart size={16} />}
                              onClick={() =>
                                handleUseSavedCart(req).then(onUseCart)
                              }
                              isLoading={loading && isCurrent}
                              disabled={isCurrent}
                              style={{ padding: 0 }}
                            />
                          </div>
                        </Tooltip>
                      </div>

                      <div className="c-action-primary">
                        <span className="fw5">{req.title}</span>
                      </div>

                      <div className="c-muted-1">
                        <span className="f6">{req.email}</span>
                      </div>

                      <div
                        className="flex flex-row items-center"
                        style={{ gap: 6 }}
                      >
                        <span className="fw5 ">
                          {
                            <FormattedPrice
                              value={parseCartData(req.data)?.value / 100}
                            />
                          }
                        </span>
                        <SavedCartDiscountBadge
                          discount={req.requestedDiscount}
                        />
                      </div>

                      {req.status === 'pending' && (
                        <div className="flex flex-row justify-between mt2">
                          <ButtonPlain
                            size="small"
                            variant="primary"
                            onClick={handleChangeCartStatus(req.id, 'denied')}
                            isLoading={isLoading(req.id, 'denied')}
                          >
                            {formatMessage(messages.discountKanbanModalDeny)}
                          </ButtonPlain>
                          <ButtonPlain
                            size="small"
                            variant="primary"
                            onClick={handleChangeCartStatus(req.id, 'approved')}
                            isLoading={isLoading(req.id, 'approved')}
                          >
                            {formatMessage(messages.discountKanbanModalApprove)}
                          </ButtonPlain>
                        </div>
                      )}
                      {['approved', 'denied'].includes(req.status) && (
                        <div className="mt2">
                          <ButtonPlain
                            size="small"
                            variant="primary"
                            onClick={handleChangeCartStatus(req.id, 'pending')}
                            isLoading={isLoading(req.id, 'pending')}
                          >
                            {formatMessage(messages.cancel)}
                          </ButtonPlain>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
