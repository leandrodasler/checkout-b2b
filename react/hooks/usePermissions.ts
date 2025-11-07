import { useMemo } from 'react'
import { useQuery } from 'react-apollo'
import { Query } from 'ssesandbox04.checkout-b2b'

import { useOrderFormCustom, useOrganization } from '.'
import { useCheckoutB2BContext } from '../CheckoutB2BContext'
import GET_APP_SETTINGS from '../graphql/getAppSettings.graphql'
import { isItemUnavailable } from '../utils'

type AppSettingsQuery = Pick<Query, 'getAppSettings'>

interface AppSettings {
  salesRepresentative: number
  salesManager: number
  salesAdmin: number
  rolesAllowedToSeeMargin: string[]
  representativeBalance: {
    enabled: boolean
    openingBalance: number
    allowNegativeBalance: boolean
  }
}

export function usePermissions() {
  const { data, loading } = useQuery<AppSettingsQuery>(GET_APP_SETTINGS, {
    notifyOnNetworkStatusChange: true,
    ssr: false,
  })

  const appSettings = data?.getAppSettings as AppSettings | undefined
  const { discountApplied } = useCheckoutB2BContext()
  const { organization } = useOrganization()
  const { role } = organization
  const { orderForm } = useOrderFormCustom()

  const isSalesUser = useMemo(
    () =>
      !!role &&
      !['customer-admin', 'customer-approver', 'customer-buyer'].includes(role),
    [role]
  )

  const maximumRoleDiscount = useMemo(() => {
    if (!appSettings) return 0

    const { salesAdmin, salesManager, salesRepresentative } = appSettings

    switch (role) {
      case 'sales-admin':
        return salesAdmin

      case 'sales-manager':
        return salesManager

      case 'sales-representative':
        return salesRepresentative

      default:
        return 0
    }
  }, [appSettings, role])

  const maximumDiscount = appSettings?.salesAdmin ?? 0

  const totalItemsWithoutDiscount =
    orderForm.totalizers.find((t) => t.id === 'Items')?.value ?? 0

  const totalItems = orderForm.items
    .filter((item) => !isItemUnavailable(item))
    .reduce((acc, item) => acc + (item.sellingPrice ?? 0) * item.quantity, 0)

  const percentualDiscount = Math.round(
    100 - (totalItems / totalItemsWithoutDiscount) * 100
  )

  const totalDiscount = Math.round(percentualDiscount + discountApplied)

  const exceedingDiscount = totalDiscount - maximumRoleDiscount

  const canSeeMargin = useMemo(
    () => appSettings?.rolesAllowedToSeeMargin.includes(role) ?? false,
    [appSettings, role]
  )

  const representativeBalanceEnabled =
    appSettings?.representativeBalance.enabled ?? false

  const allowNegativeBalance =
    appSettings?.representativeBalance.allowNegativeBalance ?? false

  const openingBalance = appSettings?.representativeBalance.openingBalance ?? 0

  return {
    loading,
    isSalesUser,
    maximumRoleDiscount,
    exceedingDiscount,
    maximumDiscount,
    canSeeMargin,
    representativeBalanceEnabled,
    allowNegativeBalance,
    openingBalance,
  }
}
