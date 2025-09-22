import React, { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from 'react-apollo'
import { useIntl } from 'react-intl'
import { Query, RepresentativeBalance } from 'ssesandbox04.checkout-b2b'
import { useRuntime } from 'vtex.render-runtime'
import {
  QueryListUsersArgs,
  Query as StorefrontPermissionsQuery,
} from 'vtex.storefront-permissions'
import { Button, InputCurrency, Spinner, Table } from 'vtex.styleguide'

import GET_REPRESENTATIVE_BALANCES from '../graphql/getRepresentativeBalances.graphql'
import LIST_USERS from '../graphql/ListUsers.graphql'
import SAVE_REPRESENTATIVE_BALANCE from '../graphql/SaveRepresentativeBalance.graphql'
import { useFormatPrice } from '../hooks'
import { usePermissions } from '../hooks/usePermissions'
import { getCurrencySymbol, messages } from '../utils'

type ListUsersQuery = Pick<StorefrontPermissionsQuery, 'listUsers'>
type GetRepresentativeBalancesQuery = Pick<Query, 'getRepresentativeBalances'>

const RepresentativeBalancesTable = () => {
  const { formatMessage } = useIntl()
  const formatPrice = useFormatPrice()
  const { currency, locale } = useRuntime().culture
  const currencySymbol = getCurrencySymbol(currency)

  const [errorMessage, setErrorMessage] = useState<React.ReactNode | null>(null)
  const {
    data: usersData,
    loading: loadingUsers,
    error: errorUsers,
  } = useQuery<ListUsersQuery, QueryListUsersArgs>(LIST_USERS)

  const {
    data: balancesData,
    loading: loadingBalances,
    error: errorBalances,
    refetch,
  } = useQuery<GetRepresentativeBalancesQuery>(GET_REPRESENTATIVE_BALANCES)

  const [saveBalance, { loading: loadingSave }] = useMutation(
    SAVE_REPRESENTATIVE_BALANCE
  )

  const {
    allowNegativeBalance,
    openingBalance,
    loading: loadingPermissions,
  } = usePermissions()

  const [representatives, setRepresentatives] = useState<
    RepresentativeBalance[]
  >([])

  const [editedBalances, setEditedBalances] = useState<Record<string, number>>(
    {}
  )

  const [isEditing, setIsEditing] = useState(false)

  const initialBalances = useMemo(() => {
    if (!usersData?.listUsers) return {}

    const balanceMap = new Map<string, RepresentativeBalance>()

    balancesData?.getRepresentativeBalances?.forEach(
      (rep?: RepresentativeBalance | null) => {
        if (rep) {
          balanceMap.set(rep.email, rep)
        }
      }
    )

    const uniqueUsers = Array.from(
      new Map(usersData.listUsers.map((u) => [u?.email, u])).values()
    ) as Array<{ email: string }>

    const mergedList = uniqueUsers.map((user, index) => {
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
    })

    setRepresentatives(mergedList)

    const initialBalancesData: Record<string, number> = {}

    mergedList.forEach((rep) => {
      initialBalancesData[rep.id] = rep.balance
    })

    return initialBalancesData
  }, [
    balancesData?.getRepresentativeBalances,
    openingBalance,
    usersData?.listUsers,
  ])

  useEffect(() => {
    setEditedBalances(initialBalances)
  }, [initialBalances])

  const handleBalanceChange = (id: string) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setEditedBalances((prev) => ({ ...prev, [id]: +e.target.value }))
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
      cellRenderer({ rowData }: { rowData: RepresentativeBalance }) {
        return isEditing ? (
          // eslint-disable-next-line jsx-a11y/no-static-element-interactions
          <div
            onKeyUp={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <InputCurrency
              disabled={loadingSave}
              size="small"
              value={editedBalances[rowData.id]}
              locale={locale}
              currencyCode={currency}
              onChange={handleBalanceChange(rowData.id)}
            />
          </div>
        ) : (
          <span>{formatPrice(rowData.balance)}</span>
        )
      },
    },
    createdIn: {
      width: 180,
      title: formatMessage(messages.representativeBalanceCreatedIn),
      cellRenderer({ rowData }: { rowData: RepresentativeBalance }) {
        return (
          <span>
            {rowData.__typename
              ? new Date(rowData.createdIn).toLocaleDateString()
              : '---'}
          </span>
        )
      },
    },
    lastInteractionIn: {
      width: 180,
      title: formatMessage(messages.representativeBalanceLastInteractionIn),
      cellRenderer({ rowData }: { rowData: RepresentativeBalance }) {
        return (
          <span>
            {rowData.__typename
              ? new Date(rowData.lastInteractionIn).toLocaleDateString()
              : '---'}
          </span>
        )
      },
    },
  }

  if (loadingUsers || loadingBalances) return <Spinner />
  if (errorUsers || errorBalances)
    return <span>{formatMessage(messages.representativeBalanceError)}</span>

  return (
    <div className="w-100 pa4 flex flex-column">
      <div className="flex items-center mb4">
        <Button
          disabled={loadingPermissions || loadingSave}
          size="small"
          variation={isEditing ? 'secondary' : 'primary'}
          onClick={() => {
            setIsEditing((prev) => !prev)
            setEditedBalances(initialBalances)
            setErrorMessage(null)
          }}
        >
          {isEditing
            ? formatMessage(messages.cancelEditButton)
            : formatMessage(messages.editBalancesButton)}
        </Button>
        {isEditing && (
          <div className="ml4">
            <Button
              disabled={loadingPermissions}
              isLoading={loadingSave}
              size="small"
              variation="primary"
              onClick={handleSave}
            >
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
        onRowClick={({ rowData }: { rowData: RepresentativeBalance }) => {
          window.location.assign(
            `/admin/app/checkout-b2b/representative-balances/transactions/${rowData.email}`
          )
        }}
        fullWidth
        items={representatives.sort((a, b) => a.email.localeCompare(b.email))}
        schema={{ properties: columns }}
      />
    </div>
  )
}

export default RepresentativeBalancesTable
