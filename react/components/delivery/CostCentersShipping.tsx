import React, { useEffect, useRef, useState } from 'react'
import { useMutation } from 'react-apollo'
import { useIntl } from 'react-intl'
import type {
  Mutation,
  MutationAddAddressToCartArgs,
} from 'ssesandbox04.checkout-b2b'
import { AddressType } from 'vtex.checkout-graphql'
import { useCssHandles } from 'vtex.css-handles'
import type { Address as StoreGraphqlAddress } from 'vtex.store-graphql'
import {
  Checkbox,
  IconInfo,
  ModalDialog,
  Spinner,
  Tooltip,
} from 'vtex.styleguide'

import { useCheckoutB2BContext } from '../../CheckoutB2BContext'
import ADD_ADDRESS_TO_CART_MUTATION from '../../graphql/addAddressToCart.graphql'
import {
  useCostCenters,
  useOrderFormCustom,
  useOrganization,
  useToast,
  useUpdateItemsQuantity,
  useUpdateShippingAddress,
} from '../../hooks'
import { isSameAddress, messages } from '../../utils'
import { Address } from './Address'
import { ShippingOption } from './ShippingOption'

type AddAddressMutation = Pick<Mutation, 'addAddressToCart'>

type Props = {
  onChangeItems: () => void
}

export function CostCentersShipping({ onChangeItems }: Props) {
  const handles = useCssHandles(['itemContent'] as const)
  const { formatMessage } = useIntl()
  const showToast = useToast()
  const { orderForm, setOrderForm } = useOrderFormCustom()
  const { organization } = useOrganization()
  const { setPending } = useCheckoutB2BContext()
  const availableCostCenters = useCostCenters()
  const [addressToBeDeleted, setAddressToBeDeleted] = useState<
    StoreGraphqlAddress | null | undefined
  >(null)

  const lastCostCenterUpdateIndexRef = useRef<string | null>(null)
  const [updateShippingAddress] = useUpdateShippingAddress()
  const { selectedAddresses, logisticsInfo } = orderForm.shippingData
  const { costCenter } = organization
  const [costCenterAddress] = costCenter?.addresses ?? []

  const [addAddress, { loading: addAddressLoading }] = useMutation<
    AddAddressMutation,
    MutationAddAddressToCartArgs
  >(ADD_ADDRESS_TO_CART_MUTATION, {
    onError: showToast,
    onCompleted(data) {
      setOrderForm({
        ...orderForm,
        ...data.addAddressToCart,
        paymentAddress: orderForm.paymentAddress,
        customData: orderForm.customData,
      })
    },
  })

  const [
    updateItemsQuantity,
    { loading: removeAddressLoading },
  ] = useUpdateItemsQuantity()

  const loading = removeAddressLoading || addAddressLoading

  useEffect(() => {
    if (
      !costCenterAddress ||
      (orderForm.shippingData.address &&
        isSameAddress(costCenterAddress, orderForm.shippingData.address))
    )
      return

    updateShippingAddress({
      variables: {
        selectedAddresses: [
          {
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
        ],
      },
    })
  }, [costCenterAddress, orderForm.shippingData.address, updateShippingAddress])

  const handleCheckCostCenter = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target

    const selectedCostCenter = availableCostCenters?.find(
      (c) => c?.costId === value
    )

    lastCostCenterUpdateIndexRef.current = value

    if (checked) {
      setPending(true)

      addAddress({
        variables: {
          address: {
            ...selectedCostCenter?.address,
            addressId: selectedCostCenter?.costId,
            isDisposable: false,
            addressQuery: undefined,
          },
        },
      }).then(() => {
        onChangeItems()
        setPending(false)
      })
    } else {
      setAddressToBeDeleted(
        selectedAddresses?.find((a) =>
          isSameAddress(a, selectedCostCenter?.address)
        )
      )
    }
  }

  const handleCancelDeleteCostCenterItems = () => {
    setPending(false)
    setAddressToBeDeleted(null)
  }

  const handleDeleteCostCenterItems = () => {
    const orderItems = logisticsInfo
      .filter((l) => l.addressId === addressToBeDeleted?.addressId)
      .map((l) => ({ index: l.itemIndex, quantity: 0 }))

    setPending(true)

    updateItemsQuantity({ variables: { orderItems } }).then(() => {
      onChangeItems()
      handleCancelDeleteCostCenterItems()
    })
  }

  const content = availableCostCenters?.map(
    (availableCostCenter, index, array) => {
      if (!availableCostCenter?.costId) return null

      const { costId, costCenterName, address } = availableCostCenter
      const isCurrentCostCenter = costId === costCenter?.id
      const hasItems = !!orderForm.items.length

      const hasCostCenter =
        selectedAddresses?.some((a) =>
          isSameAddress(a, availableCostCenter.address)
        ) && hasItems

      const isChecked = (!hasItems && isCurrentCostCenter) || hasCostCenter

      return (
        <div
          className={`flex mt3 t-mini${
            index < array.length - 1
              ? ` bb b--muted-3 mb2 pb2 ${handles.itemContent}`
              : ''
          }`}
          key={costId}
        >
          <div className={`flex flex-column${hasCostCenter ? ' w-50' : ''}`}>
            <div className="mb3 flex items-center">
              <Checkbox
                id={`cost-center-${costId}`}
                label={<span className="b t-body">{costCenterName}</span>}
                value={costId}
                disabled={loading || !hasItems}
                checked={isChecked}
                onChange={handleCheckCostCenter}
              />
              {costId === costCenter?.id && (
                <Tooltip
                  label={formatMessage(messages.userCostCenterDefaultInfo)}
                >
                  <div className="flex items-center ml1">
                    <IconInfo />
                  </div>
                </Tooltip>
              )}
              {loading && lastCostCenterUpdateIndexRef.current === costId && (
                <div className="flex items-center ml2">
                  <Spinner size={12} />
                </div>
              )}
            </div>
            <Address address={address} />
          </div>
          {availableCostCenter.costCenterName && hasCostCenter && (
            <div className="ml2 w-50">
              <ShippingOption
                costCenter={availableCostCenter.costCenterName}
                address={availableCostCenter.address}
              />
            </div>
          )}
        </div>
      )
    }
  )

  return (
    <>
      <ModalDialog
        centered
        loading={loading}
        confirmation={{
          onClick: handleDeleteCostCenterItems,
          label: formatMessage(messages.confirm),
          isDangerous: true,
        }}
        cancelation={{
          onClick: handleCancelDeleteCostCenterItems,
          label: formatMessage(messages.cancel),
        }}
        isOpen={!!addressToBeDeleted}
        onClose={handleCancelDeleteCostCenterItems}
      >
        <p>{formatMessage(messages.costCenterRemoveConfirmation)}</p>
      </ModalDialog>
      {content}
    </>
  )
}
