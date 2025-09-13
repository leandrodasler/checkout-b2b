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
import { ShippingOption } from './ShippingOption'
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
  const { shipping, items } = orderForm
  const shippingAddress = shipping?.selectedAddress
  const [costCenterAddress] = organization.costCenter?.addresses ?? []

  const [
    updateShippingAddress,
    { loading: loadingUpdateAddress },
  ] = useUpdateShippingAddress()

  useEffect(() => {
    if (
      !costCenterAddress ||
      (shippingAddress &&
        shippingAddress.addressId === costCenterAddress?.addressId)
    )
      return

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

  if (loadingUpdateAddress || loadingShippingAddress) {
    return <TotalizerSpinner />
  }

  if (!shippingAddress) {
    return <>{formatMessage(messages.emptyAddress)}</>
  }

  if ((selectedCostCenters?.length ?? 0) > 1) {
    return (
      <div className="flex flex-column flex-wrap t-mini">
        {(selectedCostCenters?.length ?? 0) > 1 &&
          selectedCostCenters?.map((costCenter, index, array) => (
            <div
              key={costCenter.costId}
              className={
                index < array.length - 1
                  ? `flex bb b--muted-3 mb2 pb2 ${handles.itemContent}`
                  : 'flex'
              }
            >
              <div
                className={`flex flex-column flex-wrap ${
                  items.length ? 'w-50' : ''
                }`}
              >
                <div className="b">{costCenter.costCenterName}</div>
                <Address address={costCenter.address} />
              </div>
              {!!items.length && costCenter.costCenterName && (
                <div className="ml3 w-50">
                  <ShippingOption
                    costCenter={costCenter.costCenterName}
                    address={{ ...costCenter.address }}
                  />
                </div>
              )}
            </div>
          ))}
      </div>
    )
  }

  const costCenterName = selectedCostCenters?.[0]?.costCenterName

  return (
    <div className="flex flex-column">
      <Address address={shippingAddress} />
      {!!items.length && costCenterName && (
        <div className="mt3">
          <ShippingOption costCenter={costCenterName} />
        </div>
      )}
    </div>
  )
}
