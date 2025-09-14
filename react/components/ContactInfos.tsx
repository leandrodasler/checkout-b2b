import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useMutation } from 'react-apollo'
import { useIntl } from 'react-intl'
import type {
  Mutation,
  MutationAddAddressToCartArgs,
} from 'ssesandbox04.checkout-b2b'
import { AddressType } from 'vtex.checkout-graphql'
import type {
  UpdateOrderFormProfileMutation,
  UpdateOrderFormProfileMutationVariables,
} from 'vtex.checkout-resources'
import { MutationUpdateOrderFormProfile } from 'vtex.checkout-resources'
import {
  Checkbox,
  IconInfo,
  Spinner,
  Tag,
  Tooltip,
  Totalizer,
} from 'vtex.styleguide'

import { useCheckoutB2BContext } from '../CheckoutB2BContext'
import ADD_ADDRESS_TO_CART_MUTATION from '../graphql/addAddressToCart.graphql'
import {
  useCostCenters,
  useOrderFormCustom,
  useOrganization,
  usePermissions,
  useToast,
  useUpdateShippingAddress,
} from '../hooks'
import { MAX_SALES_USERS_TO_SHOW, messages } from '../utils'
import { BillingAddress } from './BillingAddress'
import { RepresentativeBalanceData } from './RepresentativeBalanceData'
import { ShippingAddress } from './ShippingAddress'
import { ShowMoreButton } from './ShowMoreButton'

type AddAddressMutation = Pick<Mutation, 'addAddressToCart'>

export function ContactInfos() {
  const { formatMessage } = useIntl()
  const showToast = useToast()
  const { organization } = useOrganization()
  const {
    setOrderForm,
    orderForm,
    orderForm: { clientProfileData, shippingData },
  } = useOrderFormCustom()

  const { representativeBalanceEnabled } = usePermissions()
  const selectedAddressId = shippingData.address?.addressId
  const { selectedAddresses } = shippingData
  const { setPending, setLoadingShippingAddress } = useCheckoutB2BContext()
  const { costCenter, users, tradeName, name, roleName } = organization
  const currentCostCenterId = costCenter?.id
  const availableCostCenters = useCostCenters()
  const [updateShippingAddress] = useUpdateShippingAddress()
  const [showMoreSalesAdmin, setShowMoreSalesAdmin] = useState(false)
  const lastCostCenterUpdateIndexRef = useRef<string | null>(null)

  const [
    showMoreSalesRepresentative,
    setShowMoreSalesRepresentative,
  ] = useState(false)

  const [addAddress, { loading }] = useMutation<
    AddAddressMutation,
    MutationAddAddressToCartArgs
  >(ADD_ADDRESS_TO_CART_MUTATION, {
    onError(error) {
      showToast({ message: error.message })
    },
    onCompleted(data) {
      setOrderForm({
        ...orderForm,
        ...data.addAddressToCart,
        paymentAddress: orderForm.paymentAddress,
        customData: orderForm.customData,
      })
    },
  })

  useEffect(() => {
    if (selectedAddresses.length !== 1) return

    const [costCenterAddress] = selectedAddresses

    if (!costCenterAddress || costCenterAddress.addressId === selectedAddressId)
      return

    setPending(true)
    setLoadingShippingAddress(true)

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
    }).finally(() => {
      setPending(false)
      setLoadingShippingAddress(false)
    })
  }, [
    selectedAddressId,
    selectedAddresses,
    setLoadingShippingAddress,
    setPending,
    updateShippingAddress,
  ])

  const handleCheckCostCenter = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target

    if (!checked) return

    const selectedCostCenter = availableCostCenters?.find(
      (c) => c?.costId === value
    )

    setPending(true)
    lastCostCenterUpdateIndexRef.current = value
    addAddress({
      variables: { address: selectedCostCenter?.address },
    }).then(() => setPending(false))
  }

  const costCenterPhone = costCenter?.phoneNumber ?? ''
  const clientProfilePhone = clientProfileData?.phone

  const organizationName = useMemo(() => (tradeName ?? '') || name, [
    name,
    tradeName,
  ])

  const phone = useMemo(() => costCenterPhone || clientProfilePhone, [
    clientProfilePhone,
    costCenterPhone,
  ])

  const [updateProfile] = useMutation<
    UpdateOrderFormProfileMutation,
    UpdateOrderFormProfileMutationVariables
  >(MutationUpdateOrderFormProfile)

  useEffect(() => {
    if (!clientProfileData || clientProfileData?.tradeName) return

    const {
      corporatePhone,
      profileCompleteOnLoading,
      profileErrorOnLoading,
      customerClass,
      ...inputProfileData
    } = clientProfileData

    updateProfile({
      variables: {
        profile: { ...inputProfileData, tradeName: organizationName },
      },
    })
  }, [clientProfileData, organizationName, phone, updateProfile])

  const getUsersByRole = useCallback(
    (role: string) =>
      users
        ?.filter((user) => user?.roleId === role)
        .map((user) => user?.name)
        .sort(),
    [users]
  )

  if (!clientProfileData) return null

  const { firstName, lastName, email } = clientProfileData
  const salesRepresentative = getUsersByRole('sales-representative')
  const salesAdmin = getUsersByRole('sales-admin')
  const contactFields: Array<{
    label: string
    value: React.ReactNode
  }> = []

  if (organization) {
    contactFields.push({
      label: formatMessage(messages.companyName),
      value: (
        <>
          <div className="mb1 flex items-center flex-wrap">
            {organizationName}
            {costCenter?.name && <Tag size="small">{costCenter?.name}</Tag>}
          </div>
          {(!!salesRepresentative?.length || !!salesAdmin?.length) && (
            <span className="t-mini">
              {!!salesRepresentative?.length && (
                <>
                  <span className="b">
                    {formatMessage(messages.salesRepresentative)}
                  </span>{' '}
                  {showMoreSalesRepresentative
                    ? salesRepresentative.join(', ')
                    : salesRepresentative
                        .slice(0, MAX_SALES_USERS_TO_SHOW)
                        .join(', ')}
                  {salesRepresentative.length > MAX_SALES_USERS_TO_SHOW && (
                    <ShowMoreButton
                      isExpanded={showMoreSalesRepresentative}
                      onClick={() =>
                        setShowMoreSalesRepresentative(
                          !showMoreSalesRepresentative
                        )
                      }
                    />
                  )}
                </>
              )}
              {!!salesRepresentative?.length && !!salesAdmin?.length && <br />}
              {!!salesAdmin?.length && (
                <>
                  <span className="b">
                    {formatMessage(messages.salesAdmin)}
                  </span>{' '}
                  {showMoreSalesAdmin
                    ? salesAdmin.join(', ')
                    : salesAdmin.slice(0, MAX_SALES_USERS_TO_SHOW).join(', ')}
                  {salesAdmin.length > MAX_SALES_USERS_TO_SHOW && (
                    <ShowMoreButton
                      isExpanded={showMoreSalesAdmin}
                      onClick={() => setShowMoreSalesAdmin(!showMoreSalesAdmin)}
                    />
                  )}
                </>
              )}
            </span>
          )}
        </>
      ),
    })
  }

  contactFields.push({
    label: formatMessage(messages.buyerName),
    value: (
      <>
        <div className="mb1 flex items-center flex-wrap">
          <span>
            {firstName} {lastName}
          </span>
          <Tag size="small">{roleName}</Tag>
        </div>
        <div className="t-mini mt3">{email}</div>
        {phone && phone !== '+10000000000' && (
          <div className="t-mini mt1">{phone}</div>
        )}
        {representativeBalanceEnabled && (
          <div className="mt4">
            <RepresentativeBalanceData />
          </div>
        )}
      </>
    ),
  })

  if (availableCostCenters && availableCostCenters.length > 1) {
    contactFields.push({
      label: formatMessage(messages.costCentersLabel),
      value: (
        <>
          {availableCostCenters.map((availableCostCenter) => {
            if (!availableCostCenter?.costId) return null

            const { costId, costCenterName } = availableCostCenter
            const isCurrentCostCenter = costId === currentCostCenterId
            const hasCostCenter = selectedAddresses?.some(
              (a) => a?.addressId === availableCostCenter.address?.addressId
            )

            return (
              <div className="mv3 t-mini flex items-center" key={costId}>
                <Checkbox
                  id={`cost-center-${costId}`}
                  label={costCenterName}
                  value={costId}
                  disabled={loading}
                  checked={
                    (!orderForm.items.length && isCurrentCostCenter) ||
                    (orderForm.items.length && hasCostCenter)
                  }
                  onChange={handleCheckCostCenter}
                />
                {costId === currentCostCenterId && (
                  <Tooltip
                    label={formatMessage(messages.userCostCenterDefaultInfo)}
                  >
                    <div className="flex items-center ml1">
                      <IconInfo />
                    </div>
                  </Tooltip>
                )}
                {loading && lastCostCenterUpdateIndexRef.current === costId && (
                  <Spinner size={12} />
                )}
              </div>
            )
          })}
        </>
      ),
    })
  }

  contactFields.push({
    label: formatMessage(messages.shippingAddress),
    value: <ShippingAddress />,
  })

  contactFields.push({
    label: formatMessage(messages.billingAddress),
    value: <BillingAddress />,
  })

  return (
    <div className="mb4">
      <Totalizer items={contactFields} />
    </div>
  )
}
