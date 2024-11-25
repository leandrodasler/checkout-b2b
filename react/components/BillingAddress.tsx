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
import { addValidation, removeValidation } from 'vtex.address-form/helpers'
import { StyleguideInput } from 'vtex.address-form/inputs'
import { Button, ButtonPlain, Modal, Toggle } from 'vtex.styleguide'

import GET_LOGISTICS from '../graphql/getLogistics.graphql'
import { useOrderFormCustom } from '../hooks'
import { PaymentAddressType } from '../typings'
import { buildBillingAddress, messages, toggleAddress } from '../utils'
import { Address } from './Address'

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
  const { data: logisticsData } = useQuery(GET_LOGISTICS, { ssr: false })
  const [modalOpen, setModalOpen] = useState(false)
  const { paymentAddress, shipping } = orderForm
  const [toggle, setToggle] = useState(
    paymentAddress?.addressId === shipping.selectedAddress?.addressId
  )

  const [
    newBillingAddressState,
    setNewBillingAddressState,
  ] = useState<PaymentAddressType>(
    toggleAddress(
      addValidation(
        buildBillingAddress(paymentAddress, shipping.selectedAddress)
      ),
      !toggle
    )
  )

  const translateCountries = useCallback(() => {
    const { shipsTo = [] } = logisticsData?.logistics ?? {}

    return shipsTo.map((code: string) => ({
      label: formatMessage({ id: `country.${code}` }),
      value: code,
    }))
  }, [formatMessage, logisticsData?.logistics])

  const handleOpenModal = useCallback(() => {
    setModalOpen(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setModalOpen(false)
  }, [])

  const handleConfirm = useCallback(() => {
    setOrderForm({
      ...orderForm,
      paymentAddress: removeValidation(newBillingAddressState),
    })

    handleCloseModal()
  }, [handleCloseModal, newBillingAddressState, orderForm, setOrderForm])

  const handleNewBillingAddressChange = useCallback(
    (changedAddress: AddressFormFields) => {
      const { addressType, ...currentAddress } = newBillingAddressState
      const newAddress = { ...currentAddress, ...changedAddress }

      setNewBillingAddressState(addValidation(newAddress))
    },
    [newBillingAddressState]
  )

  const disabled = useMemo(() => {
    if (toggle) return false

    const {
      addressQuery,
      complement,
      reference,
      number,
      neighborhood,
      isDisposable,
      ...address
    } = removeValidation(newBillingAddressState)

    return Object.values(address).some((field) => !field)
  }, [newBillingAddressState, toggle])

  const handleToggle = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setToggle(e.target.checked)

      if (e.target.checked) {
        setNewBillingAddressState(
          toggleAddress(
            addValidation(buildBillingAddress(shipping.selectedAddress)),
            false
          )
        )
      } else {
        setNewBillingAddressState(
          toggleAddress(addValidation(newBillingAddressState), true)
        )
      }
    },
    [newBillingAddressState, shipping.selectedAddress]
  )

  if (!orderForm.paymentAddress) {
    return <>{formatMessage(messages.emptyAddress)}</>
  }

  return (
    <div>
      {toggle ? (
        formatMessage(messages.sameAsShipping)
      ) : (
        <Address address={paymentAddress} />
      )}

      <div className="w-100 mt3">
        <ButtonPlain
          variation="tertiary"
          size="small"
          onClick={handleOpenModal}
        >
          {formatMessage(messages.editAddress)}
        </ButtonPlain>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        size="small"
        title={formatMessage(messages.editBillingAddress)}
        aria-label={formatMessage(messages.editBillingAddress)}
        aria-describedby="modal-billing-address"
        bottomBar={
          <div className="flex items-center justify-between w-100">
            <div className="flex items-center">
              <Toggle checked={toggle} onChange={handleToggle} />
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
          country={paymentAddress?.country}
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
