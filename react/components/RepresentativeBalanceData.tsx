import React from 'react'
import { Spinner } from 'vtex.styleguide'

import { useFormatPrice, useOrderFormCustom } from '../hooks'
import { useFetchRepresentativeBalance } from '../hooks/useFetchRepresentativeBalance'

export function RepresentativeBalanceData() {
  const formatPrice = useFormatPrice()

  const {
    orderForm: { clientProfileData },
  } = useOrderFormCustom()

  const email = clientProfileData?.email

  const {
    representativeBalance,
    loading,
    error,
  } = useFetchRepresentativeBalance({
    email,
  })

  // TODO : i18n to be implemented

  if (!email) return null
  if (loading) return <Spinner size={16} />
  if (error) return <span>Erro ao carregar saldo</span>
  if (!representativeBalance) return <span>Nenhum saldo encontrado</span>

  return (
    <span>
      Saldo disponível:{' '}
      <b className="c-action-primary">
        {formatPrice(representativeBalance.balance)}
      </b>
    </span>
  )
}
