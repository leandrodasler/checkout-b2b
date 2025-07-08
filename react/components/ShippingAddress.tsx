import React, { useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { AddressType } from 'vtex.checkout-resources'
import { useCssHandles } from 'vtex.css-handles'

import { useCheckoutB2BContext } from '../CheckoutB2BContext'
import {
  useOrderFormCustom,
  useOrganization,
  useUpdateShippingAddress,
} from '../hooks'
import { messages } from '../utils'
import { Address } from './Address'
import { TotalizerSpinner } from './TotalizerSpinner'

export function ShippingAddress() {
  const handles = useCssHandles(['itemContent'])
  const { formatMessage } = useIntl()
  const {
    setPending,
    loadingShippingAddress,
    selectedCostCenters,
  } = useCheckoutB2BContext()

  const { organization } = useOrganization()
  const { orderForm } = useOrderFormCustom()
  const { shipping } = orderForm
  const [updateShippingAddress, { loading }] = useUpdateShippingAddress()
  const shippingAddress = shipping?.selectedAddress
  const [costCenterAddress] = organization.costCenter?.addresses ?? []

  useEffect(() => {
    if (shippingAddress || !costCenterAddress) return

    setPending(true)

    updateShippingAddress({
      variables: {
        address: {
          ...costCenterAddress,
          city: costCenterAddress.city ?? '',
          complement: costCenterAddress.complement ?? '',
          country: costCenterAddress.country ?? '',
          neighborhood: costCenterAddress.neighborhood ?? '',
          number: costCenterAddress.number ?? '',
          postalCode: costCenterAddress.postalCode ?? '',
          state: costCenterAddress.state ?? '',
          street: costCenterAddress.street ?? '',
          addressType: costCenterAddress.addressType as AddressType,
        },
      },
    }).finally(() => setPending(false))
  }, [costCenterAddress, setPending, shippingAddress, updateShippingAddress])

  if (loading || loadingShippingAddress) {
    return <TotalizerSpinner />
  }

  if (!shippingAddress) {
    return <>{formatMessage(messages.emptyAddress)}</>
  }

  if ((selectedCostCenters?.length ?? 0) > 1) {
    return (
      <div className="flex flex-column flex-wrap t-mini">
        {(selectedCostCenters?.length ?? 0) > 1 &&
          selectedCostCenters?.map((selectedCostCenter, index, array) => (
            <div
              key={selectedCostCenter.costId}
              className={
                index < array.length - 1
                  ? `flex flex-column flex-wrap bb b--muted-3 mb2 pb2 ${handles.itemContent}`
                  : 'flex flex-column flex-wrap'
              }
            >
              <div className="b">{selectedCostCenter?.costCenterName}</div>
              <Address address={selectedCostCenter?.address} />
            </div>
          ))}
      </div>
    )
  }

  return <Address address={shippingAddress} />
}
