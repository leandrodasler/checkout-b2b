import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useMutation } from 'react-apollo'
import { useIntl } from 'react-intl'
import { AddressType } from 'vtex.checkout-graphql'
import type {
  UpdateOrderFormProfileMutation,
  UpdateOrderFormProfileMutationVariables,
} from 'vtex.checkout-resources'
import { MutationUpdateOrderFormProfile } from 'vtex.checkout-resources'
import { Checkbox, IconInfo, Tag, Tooltip, Totalizer } from 'vtex.styleguide'

import { useCheckoutB2BContext } from '../CheckoutB2BContext'
import {
  useCostCenters,
  useOrderFormCustom,
  useOrganization,
  useToast,
  useUpdateShippingAddress,
} from '../hooks'
import { compareCostCenters, MAX_SALES_USERS_TO_SHOW, messages } from '../utils'
import { BillingAddress } from './BillingAddress'
import { ShippingAddress } from './ShippingAddress'
import { ShowMoreButton } from './ShowMoreButton'

export function ContactInfos() {
  const { formatMessage } = useIntl()
  const showToast = useToast()
  const { organization } = useOrganization()
  const {
    orderForm: { clientProfileData, shipping },
  } = useOrderFormCustom()

  const selectedAddressId = shipping.selectedAddress?.addressId

  const {
    selectedCostCenters,
    setSelectedCostCenters,
    setPending,
    setLoadingShippingAddress,
    setDeliveryOptionsByCostCenter,
  } = useCheckoutB2BContext()

  const { costCenter, users, tradeName, name, roleName } = organization
  const currentCostCenterId = costCenter?.id
  const costCenters = useCostCenters()
  const [updateShippingAddress] = useUpdateShippingAddress()

  const [
    showMoreSalesRepresentative,
    setShowMoreSalesRepresentative,
  ] = useState(false)

  const [showMoreSalesAdmin, setShowMoreSalesAdmin] = useState(false)

  useEffect(() => {
    if (!currentCostCenterId) return

    const currentCostCenter = costCenters?.find(
      (c) => c?.costId === currentCostCenterId
    )

    if (!currentCostCenter) return

    setSelectedCostCenters([currentCostCenter])
  }, [costCenters, currentCostCenterId, setSelectedCostCenters])

  useEffect(() => {
    if (selectedCostCenters?.length !== 1) return

    const costCenterAddress = selectedCostCenters?.[0]?.address

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
    selectedCostCenters,
    setLoadingShippingAddress,
    setPending,
    updateShippingAddress,
  ])

  const handleCheckCostCenter = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target

    if (checked) {
      const selectedCostCenter = costCenters?.find((c) => c?.costId === value)

      if (!selectedCostCenter) return

      setSelectedCostCenters((prev) =>
        [...(prev ?? []), selectedCostCenter].sort(compareCostCenters)
      )
    } else {
      setSelectedCostCenters((prev) => {
        if (!prev) return

        const newSelectedCostCenters = prev.filter((c) => c.costId !== value)

        if (newSelectedCostCenters.length === 0) {
          showToast({
            message: formatMessage(messages.costCentersNotEmptyError),
          })

          return prev
        }

        return newSelectedCostCenters.sort(compareCostCenters)
      })

      const costCenterName = costCenters?.find((c) => c.costId === value)
        ?.costCenterName

      if (costCenterName) {
        setDeliveryOptionsByCostCenter((prev) => {
          const filtered = Object.entries(prev).reduce(
            (acc, [costCenterFromMap, sellerSla]) => {
              if (costCenterFromMap !== costCenterName) {
                acc[costCenterFromMap] = sellerSla
              }

              return acc
            },
            {} as typeof prev
          )

          return {
            ...filtered,
          }
        })
      }
    }
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
        <span className="t-mini">{email}</span>
        {phone && phone !== '+10000000000' && (
          <>
            <br />
            <span className="t-mini">{phone}</span>
          </>
        )}
      </>
    ),
  })

  if (costCenters && costCenters.length > 1) {
    contactFields.push({
      label: formatMessage(messages.costCentersLabel),
      value: (
        <>
          {costCenters.map((userCostCenter) => {
            if (!userCostCenter?.costId) return null

            const { costId, costCenterName } = userCostCenter

            return (
              <div className="mv3 t-mini flex items-center" key={costId}>
                <Checkbox
                  id={`cost-center-${costId}`}
                  label={costCenterName}
                  value={costId}
                  checked={selectedCostCenters?.some(
                    (c) => c.costId === costId
                  )}
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
              </div>
            )
          })}
          <span className="t-mini">
            {formatMessage(messages.multipleOrdersInfo)}
          </span>
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
