import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { useRuntime } from 'vtex.render-runtime'
import {
  Button,
  IconArrowDown,
  IconArrowUp,
  Link,
  Spinner,
  Table,
  Tooltip,
} from 'vtex.styleguide'

import {
  useFetchRepresentativeBalance,
  useFetchRepresentativeBalanceTransactions,
  useFormatPrice,
} from '../hooks'
import { getOrderPlacedUrl, messages } from '../utils'

export interface Transaction {
  id: string
  email: string
  oldBalance: number
  newBalance: number
  orderGroup: string
  createdIn: string
  lastInteractionIn: string
}

export interface RepresentativeBalanceTransactionsProps {
  email: string
}

const RepresentativeBalanceTransactions = ({
  email,
}: RepresentativeBalanceTransactionsProps) => {
  const { formatMessage } = useIntl()
  const { locale } = useRuntime().culture
  const formatPrice = useFormatPrice()

  const [page, setPage] = useState<number>(1)
  const {
    transactions,
    pagination,
    loading: isLoadingTransactions,
    error,
  } = useFetchRepresentativeBalanceTransactions({ email, page })

  const {
    representativeBalance,
    loading: isLoadingBalance,
  } = useFetchRepresentativeBalance({ email })

  const columns = {
    transaction: {
      title: formatMessage(
        messages.representativeBalanceTransactionTransaction
      ),
      cellRenderer: function renderCell({ rowData }: { rowData: Transaction }) {
        const difference = rowData.newBalance - rowData.oldBalance
        const isPositive = difference > 0

        const Icon = isPositive ? IconArrowUp : IconArrowDown
        const formattedDiff = `${isPositive ? '+' : ''}${formatPrice(
          difference
        )}`

        return (
          <Tooltip label={formatPrice(difference)}>
            <div>
              <span className={`ml3 ${isPositive ? 'c-success' : 'c-danger'}`}>
                <Icon size={12} />
              </span>
              <span>{formattedDiff}</span>
            </div>
          </Tooltip>
        )
      },
    },
    oldBalance: {
      title: formatMessage(messages.representativeBalanceTransactionOldBalance),
      cellRenderer: function renderCell({ cellData }: { cellData: number }) {
        return (
          <Tooltip label={formatPrice(cellData)}>
            <span>{formatPrice(cellData)}</span>
          </Tooltip>
        )
      },
    },
    newBalance: {
      title: formatMessage(messages.representativeBalanceTransactionNewBalance),
      cellRenderer: function renderCell({ cellData }: { cellData: number }) {
        return (
          <Tooltip label={formatPrice(cellData)}>
            <span>{formatPrice(cellData)}</span>
          </Tooltip>
        )
      },
    },
    createdIn: {
      title: formatMessage(messages.representativeBalanceTransactionCreatedIn),
      cellRenderer: function renderCell({ cellData }: { cellData: string }) {
        const formatted = new Date(cellData).toLocaleString(locale)

        return (
          <Tooltip label={formatted}>
            <span>{formatted}</span>
          </Tooltip>
        )
      },
    },
    lastInteractionIn: {
      title: formatMessage(
        messages.representativeBalanceTransactionLastInteraction
      ),
      cellRenderer: function renderCell({ cellData }: { cellData: string }) {
        const formatted = new Date(cellData).toLocaleString(locale)

        return (
          <Tooltip label={formatted}>
            <span>{formatted}</span>
          </Tooltip>
        )
      },
    },
    orderGroup: {
      title: formatMessage(messages.representativeBalanceTransactionOrderGroup),
      cellRenderer: function renderCell({ cellData }: { cellData: string }) {
        return (
          <Tooltip label={`#${cellData}`}>
            <div>
              {cellData === 'admin' ? (
                <span>{cellData}</span>
              ) : (
                <Link href={getOrderPlacedUrl(cellData)} target="_blank">
                  <span className="c-action-primary">#{cellData}</span>
                </Link>
              )}
            </div>
          </Tooltip>
        )
      },
    },
  }

  if (isLoadingBalance || isLoadingTransactions) return <Spinner />

  return (
    <div className="w-100 pa4 flex flex-column">
      <div className="mb4">
        <Button
          size="small"
          variation="primary"
          onClick={() =>
            window.location.assign(
              `/admin/app/checkout-b2b/representative-balances/`
            )
          }
        >
          {formatMessage(
            messages.representativeBalanceTransactionBackToRepresentative
          )}
        </Button>
      </div>

      {!error ? (
        <div className="w-100">
          <div>
            <div className="flex flex-row justify-between">
              <p>
                <strong>
                  {formatMessage(
                    messages.representativeBalanceTransactionEmail
                  )}
                  :
                </strong>{' '}
                {email}
              </p>
              <p>
                <strong>
                  {formatMessage(
                    messages.representativeBalanceTransactionCurrentBalance
                  )}
                  :
                </strong>{' '}
                {formatPrice(representativeBalance?.balance || 0)}
              </p>
            </div>
          </div>

          <div className="w-100">
            <Table
              fullWidth
              items={transactions}
              schema={{ properties: columns }}
            />
          </div>

          <div className="flex flex-row justify-between mt4">
            <Button
              disabled={page <= 1}
              isLoading={isLoadingTransactions}
              size="small"
              variation="primary"
              onClick={() => setPage((prev) => prev - 1)}
            >
              {formatMessage(messages.representativeBalanceTransactionPageBack)}
            </Button>

            <Button
              disabled={
                !transactions.length ||
                !pagination ||
                page * pagination.pageSize >= pagination.total
              }
              isLoading={isLoadingTransactions}
              size="small"
              variation="primary"
              onClick={() => setPage((prev) => prev + 1)}
            >
              {formatMessage(messages.representativeBalanceTransactionPageNext)}
            </Button>
          </div>
        </div>
      ) : (
        <span className="c-danger">
          {formatMessage(
            messages.representativeBalanceTransactionNoTransactionsFound,
            { email }
          )}
        </span>
      )}
    </div>
  )
}

export default RepresentativeBalanceTransactions
