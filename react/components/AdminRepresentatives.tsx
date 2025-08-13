import React, { useEffect, useState } from 'react'
import { useMutation, useQuery } from 'react-apollo'
import { useRuntime } from 'vtex.render-runtime'
import { Button, InputCurrency, Table } from 'vtex.styleguide'

import GET_REPRESENTATIVE_BALANCES from '../graphql/getRepresentativeBalances.graphql'
import LIST_USERS from '../graphql/ListUsers.graphql'
import SAVE_REPRESENTATIVE_BALANCE from '../graphql/SaveRepresentativeBalance.graphql'

type RepresentativeBalance = {
  id: string
  email: string
  balance: number
  createdIn: string
  lastInteractionIn: string
}

const RepresentativeBalancesTable = () => {
  const {
    data: balancesData,
    loading: loadingBalances,
    error: errorBalances,
    refetch,
  } = useQuery(GET_REPRESENTATIVE_BALANCES)

  const {
    data: usersData,
    loading: loadingUsers,
    error: errorUsers,
  } = useQuery(LIST_USERS)

  const {
    culture: { currency },
  } = useRuntime()

  const [saveBalance] = useMutation(SAVE_REPRESENTATIVE_BALANCE)

  const [representatives, setRepresentatives] = useState<
    RepresentativeBalance[]
  >([])

  const [isEditing, setIsEditing] = useState(false)
  const [editedBalances, setEditedBalances] = useState<Record<string, number>>(
    {}
  )

  useEffect(() => {
    if (!usersData?.listUsers) return

    const uniqueEmails = Array.from<string>(
      new Set(usersData.listUsers.map((u: { email: string }) => u.email))
    ).sort((a, b) => a.localeCompare(b))

    const balanceMap = new Map<string, RepresentativeBalance>()

    balancesData?.getRepresentativeBalances?.forEach(
      (rep: RepresentativeBalance) => {
        balanceMap.set(rep.email, rep)
      }
    )

    const mergedList: RepresentativeBalance[] = uniqueEmails.map(
      (email: string, index: number) => {
        const existing = balanceMap.get(email)

        return (
          existing ?? {
            id: `new-${index}`,
            email,
            balance: 0,
            createdIn: new Date().toISOString(),
            lastInteractionIn: new Date().toISOString(),
          }
        )
      }
    )

    setRepresentatives(mergedList)

    const initial: Record<string, number> = {}

    mergedList.forEach((rep) => {
      initial[rep.id] = rep.balance
    })
    setEditedBalances(initial)
  }, [usersData, balancesData])

  const handleBalanceChange = (id: string, value: string | number) => {
    const numericValue = parseFloat(String(value).replace(',', '.'))

    setEditedBalances({
      ...editedBalances,
      [id]: Number.isNaN(numericValue) ? 0 : numericValue,
    })
  }

  const handleSave = async () => {
    const updates = representatives.map(async (rep) => {
      const newBalance = editedBalances[rep.id]

      if (rep.balance !== newBalance) {
        try {
          await saveBalance({
            variables: {
              email: rep.email,
              balance: newBalance,
              orderGroup: 'edição-tabela',
              overwrite: true,
            },
          })
        } catch (updateError) {
          console.error(`Erro ao atualizar ${rep.email}:`, updateError)
        }
      }
    })

    try {
      await Promise.all(updates)
      setIsEditing(false)
      refetch()
    } catch (err) {
      console.error('Erro ao salvar alterações:', err)
    }
  }

  const schema = {
    properties: {
      email: { title: 'Email' },
      balance: {
        title: 'Saldo (R$)',
        cellRenderer: Object.assign(
          ({
            cellData,
            rowData,
          }: {
            cellData: number
            rowData: RepresentativeBalance
          }) =>
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
              <span>{Number(cellData).toFixed(2)}</span>
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
    },
  }

  if (loadingBalances || loadingUsers) return <span>Carregando...</span>
  if (errorBalances || errorUsers) return <span>Erro ao buscar dados</span>

  return (
    <div className="w-100 pa4 flex flex-column">
      <div className="mb4">
        <Button variation="primary" onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? 'Cancelar edição' : 'Editar saldos'}
        </Button>
      </div>

      <Table
        fullWidth
        items={representatives}
        schema={schema}
        density="medium"
        emptyStateLabel="Nenhum representante encontrado"
      />

      {isEditing && (
        <div className="mt4">
          <Button variation="success" onClick={handleSave}>
            Salvar alterações
          </Button>
        </div>
      )}
    </div>
  )
}

export default RepresentativeBalancesTable
