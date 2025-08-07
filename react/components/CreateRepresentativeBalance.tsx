import React, { useState } from 'react'
import { useMutation } from 'react-apollo'
import { useRuntime } from 'vtex.render-runtime'
import { Button, Checkbox, Input, InputCurrency } from 'vtex.styleguide'

import saveRepresentativeBalance from '../graphql/SaveRepresentativeBalance.graphql'

const SaveBalanceTester = () => {
  const [email, setEmail] = useState('')
  const [balance, setBalance] = useState(0)
  const [orderGroup, setOrderGroup] = useState('')
  const [overwrite, setOverwrite] = useState(false)

  const {
    culture: { currency },
  } = useRuntime()

  const [saveBalance, { loading, error }] = useMutation(
    saveRepresentativeBalance
  )

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
          <Input
            label="Email do Representante:"
            type="email"
            value={email}
            onChange={(e: {
              target: { value: React.SetStateAction<string> }
            }) => setEmail(e.target.value)}
            required
          />
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
            onChange={(e: {
              target: { value: React.SetStateAction<string> }
            }) => setOrderGroup(e.target.value)}
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
