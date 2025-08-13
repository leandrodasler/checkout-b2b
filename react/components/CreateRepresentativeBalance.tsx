import React, { useState } from 'react'
import { useMutation, useQuery } from 'react-apollo'
import { useRuntime } from 'vtex.render-runtime'
import {
  Button,
  Checkbox,
  Dropdown,
  Input,
  InputCurrency,
} from 'vtex.styleguide'

import listUsersQuery from '../graphql/ListUsers.graphql'
import saveRepresentativeBalance from '../graphql/SaveRepresentativeBalance.graphql'

const SaveBalanceTester = () => {
  const [email, setEmail] = useState('')
  const [balance, setBalance] = useState(0)
  const [orderGroup, setOrderGroup] = useState('')
  const [overwrite, setOverwrite] = useState(false)

  const {
    culture: { currency },
  } = useRuntime()

  const { data, loading: loadingUsers } = useQuery(listUsersQuery)

  const [saveBalance, { loading, error }] = useMutation(
    saveRepresentativeBalance
  )

  const representatives = React.useMemo(() => {
    if (!data?.listUsers) return []
    const emails = data.listUsers.map((u: { email: string }) => u.email)
    const uniqueEmails = Array.from(new Set<string>(emails))

    return uniqueEmails.sort((a: string, b: string) => a.localeCompare(b))
  }, [data])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await saveBalance({
        variables: {
          email,
          balance,
          orderGroup,
          overwrite,
        },
      })
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div style={{ padding: '1rem', maxWidth: 500 }}>
      <h3>Adicionar Saldo ao Representante</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb5">
          {loadingUsers ? (
            <p>Carregando representantes...</p>
          ) : (
            <Dropdown
              label="Email do Representante:"
              options={representatives.map((rep) => ({
                value: rep,
                label: rep,
              }))}
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
              required
            />
          )}
        </div>

        <div className="mb5">
          <InputCurrency
            value={balance}
            currencyCode={currency}
            onChange={(e: { target: { value: string } }) =>
              setBalance(Number(e.target.value))
            }
            required
          />
        </div>
        <div className="mb5">
          <Input
            label="Order Group:"
            type="text"
            value={orderGroup}
            onChange={(e: { target: { value: string } }) =>
              setOrderGroup(e.target.value)
            }
            required
          />
        </div>

        <div className="mb5">
          <Checkbox
            label="Sobrescrever saldo (não somar)"
            checked={overwrite}
            onChange={() => setOverwrite(!overwrite)}
          />
        </div>

        <Button type="submit" isLoading={loading}>
          Salvar Saldo
        </Button>
      </form>

      {error && <p style={{ color: 'red' }}>Erro: {error.message}</p>}
    </div>
  )
}

export default SaveBalanceTester
