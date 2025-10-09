import React, { useCallback } from 'react'
import { useIntl } from 'react-intl'
import { SavedCart } from 'ssesandbox04.checkout-b2b'
import { FormattedPrice } from 'vtex.formatted-price'
import { ButtonPlain, Card, Tag } from 'vtex.styleguide'

import { messages } from '../utils/messages'

interface DiscountApprovalKanbanProps {
  requests?: Array<
    Pick<
      SavedCart,
      | 'id'
      | 'title'
      | 'email'
      | 'requestedDiscount'
      | 'status'
      | 'createdIn'
      | 'data'
    >
  >
}

interface CartData {
  value: number
}

export function DiscountApprovalKanban({
  requests = [],
}: DiscountApprovalKanbanProps) {
  const { formatMessage } = useIntl()

  const columns = [
    { key: 'open', label: formatMessage(messages.discountStatusOpen) },
    { key: 'pending', label: formatMessage(messages.discountStatusPending) },
    { key: 'approved', label: formatMessage(messages.discountStatusApproved) },
    { key: 'denied', label: formatMessage(messages.discountStatusDenied) },
    {
      key: 'orderApproved',
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

  return (
    <div className="flex flex-row justify-between overflow-x-auto pa2">
      {columns.map((col) => (
        <div
          key={col.key}
          className="flex flex-column mh3 bg-muted-5 br3"
          style={{
            maxWidth: '300px',
            minHeight: '240px',
            maxHeight: '420px',
          }}
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

            {groupedRequests[col.key].map((req) => (
              <Card key={req.id} className="ph4 pv2 br2 shadow-2">
                <div className="flex flex-column" style={{ gap: 6 }}>
                  <div className="c-muted-1">
                    <span className="t-mini">
                      {new Date(req.createdIn).toLocaleString()}
                    </span>
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
                    {req.requestedDiscount && (
                      <Tag size="small">{req.requestedDiscount}%</Tag>
                    )}
                  </div>

                  {/* TODO: add proper logic to both deny and approve buttons */}
                  {req.status === 'pending' && (
                    <div className="flex flex-row justify-between mt2">
                      <ButtonPlain
                        size="small"
                        variant="primary"
                        onClick={() => {}}
                      >
                        {formatMessage(messages.discountKanbanModalDeny)}
                      </ButtonPlain>
                      <ButtonPlain
                        size="small"
                        variant="primary"
                        onClick={() => {}}
                      >
                        {formatMessage(messages.discountKanbanModalApprove)}
                      </ButtonPlain>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
