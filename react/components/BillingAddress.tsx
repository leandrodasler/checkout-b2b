import React, { useCallback, useMemo, useState } from 'react'
import { useQuery } from 'react-apollo'
import { useIntl } from 'react-intl'
import {
  AddressContainer,
  AddressForm,
  AddressRules,
  CountrySelector,
  PostalCodeGetter,
} from 'vtex.address-form'
import { addValidation } from 'vtex.address-form/helpers'
import { StyleguideInput } from 'vtex.address-form/inputs'
import { Toggle, Button, Modal, Tooltip } from 'vtex.styleguide'

import GET_LOGISTICS from '../graphql/getLogistics.graphql'
import { useOrderFormCustom } from '../hooks'
import { PaymentAddresType } from '../typings'
import { extractAddressValues, getEmptyAddress, messages } from '../utils'

interface AddressFormFields {
  [key: string]: {
    value: null | string | number | number[]
    valid?: boolean
    geolocationAutoCompleted?: boolean
    postalCodeAutoCompleted?: boolean
  }
}

export function BillingAddress() {
  const { formatMessage } = useIntl()
  const { orderForm, setOrderForm } = useOrderFormCustom()

  const [toggle, setToggle] = useState({ checked: false })

  const { data: logisticsData } = useQuery(GET_LOGISTICS, { ssr: false })

  const [editAddressModalState, setEditAddressModalState] = useState({
    addressId: '',
    isOpen: false,
  })

  const [
    newBillingAddressState,
    setNewBillingAddressState,
  ] = useState<PaymentAddresType>(
    addValidation(getEmptyAddress(orderForm.paymentAddress?.country ?? ''))
  )

  const street = orderForm.paymentAddress?.street
  const number = orderForm.paymentAddress?.number
  const complement = orderForm.paymentAddress?.complement
  const postalCode = orderForm.paymentAddress?.postalCode
  const neighborhood = orderForm.paymentAddress?.neighborhood
  const city = orderForm.paymentAddress?.city
  const state = orderForm.paymentAddress?.state
  const country = orderForm.paymentAddress?.country

  const streetFormatted = street ? `${street}` : 'N/A'
  const numberFormatted = number ? `, ${number}` : ', N/A'
  const complementFormatted = complement
    ? `, ${complement}`
    : `, ${formatMessage(messages.noComplement)}`

  const postalCodeFormatted = postalCode ? ` - ${postalCode}` : ' - N/A'
  const neighborhoodFormatted = neighborhood ? `${neighborhood}, ` : 'N/A'

  const translateCountries = () => {
    const { shipsTo = [] } = logisticsData?.logistics ?? {}

    return shipsTo.map((code: string) => ({
      label: formatMessage({ id: `country.${code}` }),
      value: code,
    }))
  }

  const handleOpenModal = () => {
    setEditAddressModalState({
      addressId: orderForm.paymentAddress?.addressId ?? '',
      isOpen: true,
    })
  }

  const handleCloseModal = useCallback(() => {
    setEditAddressModalState((prev) => ({ ...prev, isOpen: false }))
  }, [])

  const handleConfirm = () => {
    if (toggle.checked) {
      setOrderForm({
        ...orderForm,
        paymentAddress: orderForm.shipping?.selectedAddress,
      })
    } else {
      setOrderForm({
        ...orderForm,
        paymentAddress: extractAddressValues(newBillingAddressState),
      })
    }

    setToggle({ checked: false })
    handleCloseModal()
  }

  const handleNewBillingAddressChange = (changedAddress: AddressFormFields) => {
    const currentAddress = newBillingAddressState

    const newAddress = { ...currentAddress, ...changedAddress }

    setNewBillingAddressState(addValidation(newAddress))
  }

  const disabled = useMemo(() => {
    if (toggle.checked) return false

    const address = extractAddressValues(newBillingAddressState)

    delete address.addressQuery
    delete address.complement

    return Object.values(address).some((field) => !field)
  }, [newBillingAddressState, toggle.checked])

  const formattedAddres = useMemo(
    () => (
      <>
        {streetFormatted}
        {numberFormatted}
        {complementFormatted}
        {postalCodeFormatted}
        <br />
        {neighborhoodFormatted}
        {city}, {state}, {formatMessage({ id: `country.${country}` })}
      </>
    ),
    [
      streetFormatted,
      numberFormatted,
      complementFormatted,
      postalCodeFormatted,
      neighborhoodFormatted,
      city,
      state,
      country,
      formatMessage,
    ]
  )

  if (!orderForm.paymentAddress) {
    return <>{formatMessage(messages.emptyAddress)}</>
  }

  return (
    <div>
      <Tooltip label={formattedAddres}>
        <div className="mb3 truncate">{formattedAddres}</div>
      </Tooltip>

      <div className="w-100">
        <Button variation="tertiary" size="small" onClick={handleOpenModal}>
          {formatMessage(messages.editAddress)}
        </Button>
      </div>

      <Modal
        isOpen={editAddressModalState.isOpen}
        onClose={handleCloseModal}
        size="small"
        title={formatMessage(messages.editBillingAddress)}
        aria-label={formatMessage(messages.editBillingAddress)}
        aria-describedby="modal-billing-address"
        bottomBar={
          <div className="flex items-center justify-between w-100">
            <div className="flex items-center">
              <Toggle
                checked={toggle.checked}
                onChange={() =>
                  setToggle((prev) => ({
                    ...prev,
                    checked: !prev.checked,
                  }))
                }
              />
              <span className="ml4 c-action-secondary t-mini mw9">
                {formatMessage(messages.sameAsShipping)}
              </span>
            </div>

            <div>
              <span className="mr4">
                <Button variation="tertiary" onClick={handleCloseModal}>
                  {formatMessage(messages.cancel)}
                </Button>
              </span>
              <span>
                <Button
                  variation="primary"
                  onClick={handleConfirm}
                  disabled={disabled}
                >
                  {formatMessage(messages.confirm)}
                </Button>
              </span>
            </div>
          </div>
        }
      >
        <AddressRules
          country={country}
          shouldUseIOFetching
          useGeolocation={false}
        >
          <AddressContainer
            address={newBillingAddressState}
            Input={StyleguideInput}
            onChangeAddress={handleNewBillingAddressChange}
            autoCompletePostalCode
          >
            <CountrySelector shipsTo={translateCountries()} />

            <PostalCodeGetter />

            <AddressForm
              Input={StyleguideInput}
              omitAutoCompletedFields={false}
              omitPostalCodeFields
            />
          </AddressContainer>
        </AddressRules>
      </Modal>
    </div>
  )
}
