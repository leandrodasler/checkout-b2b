import React, { useEffect, useState } from 'react'
import { useMutation, useQuery } from 'react-apollo'
import { useIntl } from 'react-intl'
import { useRuntime } from 'vtex.render-runtime'
import { Button, InputCurrency, Spinner, Table } from 'vtex.styleguide'

import GET_REPRESENTATIVE_BALANCES from '../graphql/getRepresentativeBalances.graphql'
import LIST_USERS from '../graphql/ListUsers.graphql'
import SAVE_REPRESENTATIVE_BALANCE from '../graphql/SaveRepresentativeBalance.graphql'
import { useFormatPrice } from '../hooks'
import { usePermissions } from '../hooks/usePermissions'
import { getCurrencySymbol, messages } from '../utils'

type RepresentativeBalance = {
  id: string
  email: string
  balance: number
  createdIn: string
  lastInteractionIn: string
}

const RepresentativeBalancesTable = () => {
  const { formatMessage } = useIntl()
  const formatPrice = useFormatPrice()
  const {
    culture: { currency },
  } = useRuntime()

  const currencySymbol = getCurrencySymbol(currency)

  const [errorMessage, setErrorMessage] = useState<React.ReactNode | null>(null)
  const {
    data: usersData,
    loading: loadingUsers,
    error: errorUsers,
  } = useQuery(LIST_USERS)

  const {
    data: balancesData,
    loading: loadingBalances,
    error: errorBalances,
    refetch,
  } = useQuery(GET_REPRESENTATIVE_BALANCES)

  const [saveBalance] = useMutation(SAVE_REPRESENTATIVE_BALANCE)

  const { allowNegativeBalance, openingBalance } = usePermissions()

  const [representatives, setRepresentatives] = useState<
    RepresentativeBalance[]
  >([])

  const [editedBalances, setEditedBalances] = useState<Record<string, number>>(
    {}
  )

  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (!usersData?.listUsers) return

    const balanceMap = new Map<string, RepresentativeBalance>()

    balancesData?.getRepresentativeBalances?.forEach(
      (rep: RepresentativeBalance) => {
        balanceMap.set(rep.email, rep)
      }
    )

    const uniqueUsers = Array.from(
      new Map(
        usersData.listUsers.map((u: { email: string }) => [u.email, u])
      ).values()
    ) as Array<{ email: string }>

    const mergedList: RepresentativeBalance[] = uniqueUsers.map(
      (user, index) => {
        const existing = balanceMap.get(user.email)

        return (
          existing ?? {
            id: `new-${index}`,
            email: user.email,
            balance: openingBalance,
            createdIn: new Date().toISOString(),
            lastInteractionIn: new Date().toISOString(),
          }
        )
      }
    )

    setRepresentatives(mergedList)

    const initialBalances: Record<string, number> = {}

    mergedList.forEach((rep) => {
      initialBalances[rep.id] = rep.balance
    })
    setEditedBalances(initialBalances)
  }, [usersData, balancesData, openingBalance])

  const handleBalanceChange = (id: string, value: string | number) => {
    const numericValue = parseFloat(String(value).replace(',', '.'))

    setEditedBalances({ ...editedBalances, [id]: numericValue })
  }

  const handleSave = async () => {
    setErrorMessage(null)

    const negativeErrors = representatives
      .filter((rep) => !allowNegativeBalance && editedBalances[rep.id] < 0)
      .map((rep) => rep.email)

    if (negativeErrors.length) {
      setErrorMessage(
        formatMessage(messages.representativeBalanceNegativeError, {
          emails: (
            <ul key="negativeBalanceEmailsError">
              {negativeErrors.map((email) => (
                <li key={email}>{email}</li>
              ))}
            </ul>
          ),
        })
      )

      return
    }

    const updates = representatives
      .filter((rep) => rep.balance !== editedBalances[rep.id])
      .map((rep) =>
        saveBalance({
          variables: {
            email: rep.email,
            balance: editedBalances[rep.id],
            orderGroup: 'admin',
            overwrite: true,
          },
        })
      )

    try {
      await Promise.all(updates)
      setIsEditing(false)
      refetch()
    } catch (err) {
      setErrorMessage(err.message)
    }
  }

  const columns = {
    email: { title: formatMessage(messages.representativeBalanceEmail) },
    balance: {
      width: 180,
      title: formatMessage(messages.representativeBalanceValue, {
        currency: currencySymbol,
      }),
      cellRenderer: Object.assign(
        ({ rowData }: { rowData: RepresentativeBalance }) =>
          isEditing ? (
            <InputCurrency
              size="small"
              value={editedBalances[rowData.id]?.toString() ?? ''}
              currencyCode={currency}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleBalanceChange(rowData.id, e.target.value)
              }
            />
          ) : (
            <span>
              {formatPrice(rowData.balance).replace(currencySymbol, '')}
            </span>
          ),
        { displayName: 'BalanceCellRenderer' }
      ),
    },
    createdIn: {
      width: 180,
      title: formatMessage(messages.representativeBalanceCreatedIn),
      cellRenderer: Object.assign(
        ({ cellData }: { cellData: string }) => (
          <span>{new Date(cellData).toLocaleDateString()}</span>
        ),
        { displayName: 'CreatedInCellRenderer' }
      ),
    },
    lastInteractionIn: {
      width: 180,
      title: formatMessage(messages.representativeBalanceLastInteractionIn),
      cellRenderer: Object.assign(
        ({ cellData }: { cellData: string }) => (
          <span>{new Date(cellData).toLocaleDateString()}</span>
        ),
        { displayName: 'LastInteractionInCellRenderer' }
      ),
    },
  }

  if (loadingUsers || loadingBalances) return <Spinner />
  if (errorUsers || errorBalances)
    return <span>{formatMessage(messages.representativeBalanceError)}</span>

  return (
    <div className="w-100 pa4 flex flex-column">
      <div className="flex mb4">
        <Button
          variation={isEditing ? 'secondary' : 'primary'}
          onClick={() => {
            setIsEditing((prev) => !prev)
            setErrorMessage(null)
          }}
        >
          {isEditing
            ? formatMessage(messages.cancelEditButton)
            : formatMessage(messages.editBalancesButton)}
        </Button>
        {isEditing && (
          <div className="ml4">
            <Button variation="success" onClick={handleSave}>
              {formatMessage(messages.saveBalancesButton)}
            </Button>
          </div>
        )}
      </div>
      {errorMessage && (
        <div className="mb4">
          <span className="c-danger">{errorMessage}</span>
        </div>
      )}
      <Table
        onRowClick={() => {}}
        fullWidth
        items={representatives.sort((a, b) => a.email.localeCompare(b.email))}
        schema={{ properties: columns }}
      />
    </div>
  )
}

export default RepresentativeBalancesTable
