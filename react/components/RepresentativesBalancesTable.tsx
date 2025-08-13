import React, { useEffect, useState } from 'react'
import { useMutation, useQuery } from 'react-apollo'
import { useIntl } from 'react-intl'
import { useRuntime } from 'vtex.render-runtime'
import { Button, InputCurrency, Table } from 'vtex.styleguide'

import GET_REPRESENTATIVE_BALANCES from '../graphql/getRepresentativeBalances.graphql'
import LIST_USERS from '../graphql/ListUsers.graphql'
import SAVE_REPRESENTATIVE_BALANCE from '../graphql/SaveRepresentativeBalance.graphql'
import { usePermissions } from '../hooks/usePermissions'
import { messages } from '../utils'

type RepresentativeBalance = {
  id: string
  email: string
  balance: number
  createdIn: string
  lastInteractionIn: string
}

const RepresentativeBalancesTable = () => {
  const { formatMessage } = useIntl()
  const {
    culture: { currency },
  } = useRuntime()

  const [errorMessage, setErrorMessage] = useState<string | null>(null)
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

  const [saveBalance, { loading: saving }] = useMutation(
    SAVE_REPRESENTATIVE_BALANCE
  )

  const { allowNegativeBalance } = usePermissions()

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
            balance: 0,
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
  }, [usersData, balancesData])

  const handleBalanceChange = (id: string, value: string | number) => {
    const numericValue = parseFloat(String(value).replace(',', '.'))

    setEditedBalances({ ...editedBalances, [id]: numericValue })
  }

  const handleSave = async () => {
    setErrorMessage(null)

    const negativeErrors = representatives
      .filter((rep) => !allowNegativeBalance && editedBalances[rep.id] < 0)
      .map((rep) => `Saldo negativo não permitido para ${rep.email}.`)

    if (negativeErrors.length) {
      setErrorMessage(negativeErrors.join(' '))

      return
    }

    const updates = representatives
      .filter((rep) => rep.balance !== editedBalances[rep.id])
      .map((rep) =>
        saveBalance({
          variables: {
            email: rep.email,
            balance: editedBalances[rep.id],
            orderGroup: 'edição-tabela',
            overwrite: true,
          },
        })
      )

    try {
      await Promise.all(updates)
      setIsEditing(false)
      refetch()
    } catch (err) {
      console.error('Erro ao salvar alterações:', err)
      setErrorMessage('Erro ao salvar alterações. Tente novamente.')
    }
  }

  const columns = {
    email: { title: 'Email' },
    balance: {
      title: 'Saldo (R$)',
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
            <span>{Number(rowData.balance).toFixed(2)}</span>
          ),
        { displayName: 'BalanceCellRenderer' }
      ),
    },
    createdIn: {
      title: 'Criado em',
      cellRenderer: Object.assign(
        ({ cellData }: { cellData: string }) => (
          <span>{new Date(cellData).toLocaleDateString()}</span>
        ),
        { displayName: 'CreatedInCellRenderer' }
      ),
    },
    lastInteractionIn: {
      title: 'Última interação',
      cellRenderer: Object.assign(
        ({ cellData }: { cellData: string }) => (
          <span>{new Date(cellData).toLocaleDateString()}</span>
        ),
        { displayName: 'LastInteractionInCellRenderer' }
      ),
    },
  }

  if (loadingUsers || loadingBalances) return <span>Carregando...</span>
  if (errorUsers || errorBalances) return <span>Erro ao buscar dados</span>

  return (
    <div className="w-100 pa4 flex flex-column">
      <div className="mb4">
        <Button variation="primary" onClick={() => setIsEditing(!isEditing)}>
          {isEditing
            ? formatMessage(messages.cancelEditButton)
            : formatMessage(messages.editBalancesButton)}
        </Button>
      </div>
      {errorMessage && (
        <div className="mb4">
          <span className="c-danger">{errorMessage}</span>
        </div>
      )}
      <Table items={representatives} schema={{ properties: columns }} />
      {isEditing && (
        <div className="mt4">
          <Button variation="success" onClick={handleSave}>
            {formatMessage(messages.saveBalancesButton)}
          </Button>
        </div>
      )}
    </div>
  )
}

export default RepresentativeBalancesTable
