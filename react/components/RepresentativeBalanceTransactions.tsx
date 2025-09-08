import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { Button, Link, Spinner, Table, Tooltip } from 'vtex.styleguide'
import { useFormatPrice } from '../hooks'
import { useFetchRepresentativeBalance } from '../hooks/useFetchRepresentativeBalance'
import { useFetchRepresentativeBalanceTransactions } from '../hooks/useFetchRepresentativeBalanceTransactions'
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
  const formatPrice = useFormatPrice()

  const [page, setPage] = useState<number>(1)
  const { transactions, loading: isLoadingTransactions, error } =
    useFetchRepresentativeBalanceTransactions({ email, page })
  const { representativeBalance, loading: isLoadingBalance } =
    useFetchRepresentativeBalance({ email })

  const columns = {
    transaction: {
      width: 120,
      title: formatMessage(messages.representativeBalanceTransactionTransaction),
      cellRenderer: ({ rowData }: { rowData: Transaction }) => (
        <Tooltip label={formatPrice(rowData.newBalance - rowData.oldBalance)}>
          <span>{formatPrice(rowData.newBalance - rowData.oldBalance)}</span>
        </Tooltip>
      ),
    },
    oldBalance: {
      width: 140,
      title: formatMessage(messages.representativeBalanceTransactionOldBalance),
      cellRenderer: ({ cellData }: { cellData: number }) => (
        <Tooltip label={formatPrice(cellData)}>
          <span>{formatPrice(cellData)}</span>
        </Tooltip>
      ),
    },
    newBalance: {
      width: 140,
      title: formatMessage(messages.representativeBalanceTransactionNewBalance),
      cellRenderer: ({ cellData }: { cellData: number }) => (
        <Tooltip label={formatPrice(cellData)}>
          <span>{formatPrice(cellData)}</span>
        </Tooltip>
      ),
    },
    createdIn: {
      width: 180,
      title: formatMessage(messages.representativeBalanceTransactionCreatedIn),
      cellRenderer: ({ cellData }: { cellData: string }) => {
        const formatted = new Date(cellData).toLocaleString()
        return (
          <Tooltip label={formatted}>
            <span>{formatted}</span>
          </Tooltip>
        )
      },
    },
    lastInteractionIn: {
      width: 180,
      title: formatMessage(
        messages.representativeBalanceTransactionLastInteraction
      ),
      cellRenderer: ({ cellData }: { cellData: string }) => {
        const formatted = new Date(cellData).toLocaleString()
        return (
          <Tooltip label={formatted}>
            <span>{formatted}</span>
          </Tooltip>
        )
      },
    },
    orderGroup: {
      width: 150,
      title: formatMessage(messages.representativeBalanceTransactionOrderGroup),
      cellRenderer: ({ cellData }: { cellData: string }) => (
        <Tooltip label={formatMessage(messages.multipleOrdersLink)}>
          <div>
            <Link href={getOrderPlacedUrl(cellData)} target="_blank">
              <span className="c-action-primary">#{cellData}</span>
            </Link>
          </div>
        </Tooltip>
      ),
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
                  {formatMessage(messages.representativeBalanceTransactionEmail)}
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

          <div className="w-100 flex flex-column">
            <Table
              fullWidth
              items={transactions}
              schema={{ properties: columns }}
              density="low"
            />
            <div className="flex flex-row justify-between mt4">
              <Button
                disabled={page <= 1}
                isLoading={isLoadingTransactions}
                size="small"
                variation="primary"
                onClick={() => setPage((page) => page - 1)}
              >
                {formatMessage(messages.representativeBalanceTransactionPageBack)}
              </Button>
              <Button
                disabled={!transactions.length}
                isLoading={isLoadingTransactions}
                size="small"
                variation="primary"
                onClick={() => setPage((page) => page + 1)}
              >
                {formatMessage(messages.representativeBalanceTransactionPageNext)}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <span className="c-danger">
          {formatMessage(messages.representativeBalanceTransactionNoTransactionsFound, { email })}
        </span>
      )}
    </div>
  )
}

export default RepresentativeBalanceTransactions
