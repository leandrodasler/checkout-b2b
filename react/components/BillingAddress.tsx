import React, { useState } from 'react'
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
import { Button, Modal } from 'vtex.styleguide'
import { useQuery } from 'react-apollo'

import GET_LOGISTICS from '../graphql/getLogistics.graphql'
import { useOrderFormCustom } from '../hooks'
import { messages } from '../utils'

interface AddressFormFields {
  [key: string]: {
    value: null | string | number | number[]
    valid?: boolean
    geolocationAutoCompleted?: boolean
    postalCodeAutoCompleted?: boolean
  }
}

export const getEmptyAddress = (country: string) => {
  return {
    addressId: '0',
    addressType: 'commercial',
    city: null,
    complement: null,
    country,
    receiverName: '',
    geoCoordinates: [],
    neighborhood: null,
    number: null,
    postalCode: null,
    reference: null,
    state: null,
    street: null,
    addressQuery: null,
  }
}

type AddressData = {
  [key: string]: { value: any }
}

type ExtractedValues = {
  [key: string]: any
}

function extractValues(data: AddressData): ExtractedValues {
  const extractedValues: ExtractedValues = {}

  for (const key in data) {
    if (data[key].value !== undefined) {
      extractedValues[key] = data[key].value
    }
  }

  return extractedValues
}

export function BillingAddress() {
  const { formatMessage } = useIntl()
  const { orderForm, setOrderForm } = useOrderFormCustom()

  const { data: logisticsData } = useQuery(GET_LOGISTICS, { ssr: false })

  const [editAddressModalState, setEditAddressModalState] = useState({
    addressId: '',
    isOpen: false,
  })

  const [newBillingAddressState, setNewBillingAddressState] = useState(
    addValidation(
      getEmptyAddress(orderForm.shipping.selectedAddress?.country ?? '')
    )
  )

  if (!orderForm.shipping?.selectedAddress) {
    return <>{formatMessage(messages.emptyAddress)}</>
  }

  const {
    street,
    number,
    complement,
    postalCode,
    neighborhood,
    city,
    state,
    country,
  } = orderForm.shipping.selectedAddress

  const numberFormatted = number ? `, ${number}` : ''
  const complementFormatted = complement ? `, ${complement}` : ''
  const postalCodeFormatted = postalCode ? ` - ${postalCode}` : ''
  const neighborhoodFormatted = neighborhood ? `${neighborhood}, ` : ''

  const handleOpenModal = () => {
    setEditAddressModalState({
      addressId: orderForm.shipping.selectedAddress?.addressId ?? '',
      isOpen: true,
    })
  }

  const handleCloseModal = () => {
    setEditAddressModalState((prev) => ({ ...prev, isOpen: false }))
  }

  const handleConfirm = () => {
    setOrderForm({
      ...orderForm,
      paymentAddress: extractValues(newBillingAddressState),
    })

    handleCloseModal()
  }

  const handleNewBillingAddressChange = (changedAddress: AddressFormFields) => {
    const currentAddress = newBillingAddressState

    const newAddress = { ...currentAddress, ...changedAddress }

    setNewBillingAddressState(addValidation(newAddress))
  }

  const translateCountries = () => {
    const { shipsTo = [] } = logisticsData?.logistics ?? {}

    return shipsTo.map((code: string) => ({
      label: formatMessage({ id: `store/checkout.b2b.country.${code}` }),
      value: code,
    }))
  }

  return (
    <div>
      <div className="mb3">
        {street}
        {numberFormatted}
        {complementFormatted}
        {postalCodeFormatted}
        <br />
        {neighborhoodFormatted}
        {city}, {state}, {country}
      </div>

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
          <div className="nowrap">
            <span className="mr4">
              <Button variation="tertiary" onClick={handleCloseModal}>
                {formatMessage(messages.cancel)}
              </Button>
            </span>
            <span>
              <Button variation="primary" onClick={handleConfirm}>
                {formatMessage(messages.confirm)}
              </Button>
            </span>
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
