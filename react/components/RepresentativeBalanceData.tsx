import React from 'react'
import { Spinner, Tooltip } from 'vtex.styleguide'

import { useFormatPrice, useOrderFormCustom } from '../hooks'
import { useFetchRepresentativeBalance } from '../hooks/useFetchRepresentativeBalance'

export function RepresentativeBalanceData() {
  const formatPrice = useFormatPrice()

  const {
    orderForm: { clientProfileData, totalizers = [] },
  } = useOrderFormCustom()

  const discounts =
    (totalizers.find((totalizer) => totalizer.id === 'Discounts')?.value ?? 0) /
    100

  const email = clientProfileData?.email

  const {
    representativeBalance,
    loading,
    error,
  } = useFetchRepresentativeBalance({
    email,
  })

  const finalBalance =
    parseFloat((representativeBalance?.balance ?? 0).toFixed(2)) + discounts

  // TODO : i18n to be implemented

  if (!email) return null
  if (loading) return <Spinner size={16} />
  if (error) return <span>Erro ao carregar saldo</span>
  if (!representativeBalance) return <span>Nenhum saldo encontrado</span>

  return (
    <span>
      Saldo disponível:{' '}
      <Tooltip
        label={
          <span>
            Saldo inicial: <b>{formatPrice(representativeBalance.balance)}</b>
            <br />
            Alterações aplicadas: <b>{formatPrice(discounts)}</b>
          </span>
        }
      >
        <b className="c-action-primary">{formatPrice(finalBalance)}</b>
      </Tooltip>
    </span>
  )
}
