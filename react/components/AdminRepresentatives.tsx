import React, { useEffect, useState } from 'react'
import { useQuery } from 'react-apollo'
import { Button, Input, Table } from 'vtex.styleguide'

import GET_REPRESENTATIVE_BALANCES from '../graphql/getRepresentativeBalances.graphql'

type RepresentativeBalance = {
  id: string
  email: string
  balance: number
  createdIn: string
  lastInteractionIn: string
}

const RepresentativeBalancesTable = () => {
  const { data, loading, error } = useQuery(GET_REPRESENTATIVE_BALANCES)
  const [representatives, setRepresentatives] = useState<
    RepresentativeBalance[]
  >([])

  const [isEditing, setIsEditing] = useState(false)
  const [editedBalances, setEditedBalances] = useState<Record<string, number>>(
    {}
  )

  useEffect(() => {
    if (!data?.getRepresentativeBalances) {
      return
    }

    setRepresentatives(data.getRepresentativeBalances)

    // Inicializa saldos editáveis com valores atuais
    const initialBalances: Record<string, number> = {}

    data.getRepresentativeBalances.forEach((rep: RepresentativeBalance) => {
      initialBalances[rep.id] = rep.balance
    })
    setEditedBalances(initialBalances)
  }, [data])

  const handleBalanceChange = (id: string, value: string) => {
    const numericValue = parseFloat(value.replace(',', '.'))

    setEditedBalances({
      ...editedBalances,
      [id]: Number.isNaN(numericValue) ? 0 : numericValue,
    })
  }

  const handleSave = () => {
    // Aqui você pode fazer a mutation para salvar os saldos alterados
    // eslint-disable-next-line no-console
    console.log('Valores salvos:', editedBalances)
    setIsEditing(false)
  }

  const schema = {
    properties: {
      email: {
        title: 'Email',
      },
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
            <Input
              size="small"
              value={editedBalances[rowData.id]?.toString() ?? ''}
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
        cellRenderer: function LastInteractionInCellRenderer({
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
