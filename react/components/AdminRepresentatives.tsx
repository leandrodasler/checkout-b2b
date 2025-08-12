import React, { useEffect, useState } from 'react'
import { useMutation, useQuery } from 'react-apollo'
import { useRuntime } from 'vtex.render-runtime'
import { Button, InputCurrency, Table } from 'vtex.styleguide'

import GET_REPRESENTATIVE_BALANCES from '../graphql/getRepresentativeBalances.graphql'
import SAVE_REPRESENTATIVE_BALANCE from '../graphql/SaveRepresentativeBalance.graphql'

type RepresentativeBalance = {
  id: string
  email: string
  balance: number
  createdIn: string
  lastInteractionIn: string
}

const RepresentativeBalancesTable = () => {
  const { data, loading, error, refetch } = useQuery(
    GET_REPRESENTATIVE_BALANCES
  )

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
    if (!data?.getRepresentativeBalances) return

    setRepresentatives(data.getRepresentativeBalances)

    const initial: Record<string, number> = {}

    data.getRepresentativeBalances.forEach((rep: RepresentativeBalance) => {
      initial[rep.id] = rep.balance
    })
    setEditedBalances(initial)
  }, [data])

  const handleBalanceChange = (id: string, value: string | number) => {
    const stringValue = String(value)
    const numericValue = parseFloat(stringValue.replace(',', '.'))

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
        cellRenderer: function BalanceCellRenderer({
          cellData,
          rowData,
        }: {
          cellData: number
          rowData: RepresentativeBalance
        }) {
          return isEditing ? (
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
          )
        },
      },
      createdIn: {
        title: 'Criado em',
        cellRenderer: function CreatedInCellRenderer({
          cellData,
        }: {
          cellData: string
        }) {
          return <span>{new Date(cellData).toLocaleDateString()}</span>
        },
      },
      lastInteractionIn: {
        title: 'Última interação',
        cellRenderer: function LastInteractionCellRenderer({
          cellData,
        }: {
          cellData: string
        }) {
          return <span>{new Date(cellData).toLocaleDateString()}</span>
        },
      },
    },
  }

  if (loading) return <span>Carregando...</span>
  if (error) return <span>Erro ao buscar dados</span>

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
