import React, { useEffect } from 'react'
import { useMutation } from 'react-apollo'
import { useIntl } from 'react-intl'
import type {
  AddressType,
  UpdateSelectedAddressMutation,
  UpdateSelectedAddressMutationVariables,
} from 'vtex.checkout-resources'
import { MutationUpdateSelectedAddress } from 'vtex.checkout-resources'

import { useCheckoutB2BContext } from '../CheckoutB2BContext'
import { useOrderFormCustom, useOrganization, useToast } from '../hooks'
import type { CompleteOrderForm } from '../typings'
import { messages } from '../utils'
import { Address } from './Address'
import { TotalizerSpinner } from './TotalizerSpinner'

export function ShippingAddress() {
  const showToast = useToast()
  const { formatMessage } = useIntl()
  const { setPending } = useCheckoutB2BContext()
  const { organization } = useOrganization()
  const {
    orderForm,
    orderForm: { shipping },
    setOrderForm,
  } = useOrderFormCustom()

  const [updateShippingAddress, { loading }] = useMutation<
    UpdateSelectedAddressMutation,
    UpdateSelectedAddressMutationVariables
  >(MutationUpdateSelectedAddress, {
    onCompleted({ updateSelectedAddress }) {
      setOrderForm({
        ...orderForm,
        paymentAddress:
          orderForm.paymentAddress ??
          updateSelectedAddress.shipping.selectedAddress,
        ...updateSelectedAddress,
      } as CompleteOrderForm)
    },
    onError({ message }) {
      showToast({ message })
    },
  })

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

  if (loading) {
    return <TotalizerSpinner />
  }

  if (!shippingAddress) {
    return <>{formatMessage(messages.emptyAddress)}</>
  }

  return <Address address={shippingAddress} />
}
