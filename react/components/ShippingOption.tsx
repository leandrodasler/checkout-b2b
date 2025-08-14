import React, { useEffect } from 'react'
import { useQuery } from 'react-apollo'
import { useIntl } from 'react-intl'
import { Address } from 'vtex.b2b-organizations-graphql'
import { useCssHandles } from 'vtex.css-handles'
import type {
  QueryShippingArgs,
  Query as StoreGraphqlQuery,
} from 'vtex.store-graphql'

import { useCheckoutB2BContext } from '../CheckoutB2BContext'
import GET_SHIPPING from '../graphql/getShipping.graphql'
import { useFormatPrice, useOrderFormCustom, useToast } from '../hooks'
import { groupShippingOptionsBySeller, messages } from '../utils'
import { Sla } from './Sla'
import { SlaDropdown } from './SlaDrodown'
import { TotalizerSpinner } from './TotalizerSpinner'

type QueryShipping = Pick<StoreGraphqlQuery, 'shipping'>
type Props = {
  costCenter: string
  address?: Address | null
}

export function ShippingOption({ costCenter, address }: Props) {
  const showToast = useToast()
  const handles = useCssHandles(['shippingEstimates'])
  const { formatMessage } = useIntl()
  const { orderForm } = useOrderFormCustom()
  const {
    selectedCostCenters,
    deliveryOptionsByCostCenter,
    setDeliveryOptionsByCostCenter,
    setLoadingGetShipping,
  } = useCheckoutB2BContext()

  const { selectedAddress } = orderForm.shipping
  const formatPrice = useFormatPrice()
  const hasMultipleCostCenters = (selectedCostCenters?.length ?? 0) > 1
  const currentAddress = address ?? selectedAddress

  const { data: shippingData, loading } = useQuery<
    QueryShipping,
    QueryShippingArgs
  >(GET_SHIPPING, {
    ssr: false,
    skip: !currentAddress,
    variables: {
      postalCode: currentAddress?.postalCode,
      geoCoordinates: currentAddress?.geoCoordinates?.map((c) => String(c)),
      country: currentAddress?.country,
      items: orderForm.items.map((item) => ({
        id: item.id,
        quantity: String(item.quantity),
        seller: item.seller,
      })),
    },
    onCompleted() {
      window.setTimeout(() => setLoadingGetShipping(false), 2000)
    },
    onError({ message }) {
      showToast({ message })
    },
  })

  const shippingOptionsBySeller = groupShippingOptionsBySeller(
    shippingData?.shipping
  )

  const handleChange = (seller: string) => (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newDeliveryOption = Object.values(shippingOptionsBySeller)
      .find((slas) => slas.find((sla) => sla.id === e.target.value))
      ?.find((sla) => sla.id === e.target.value)

    if (newDeliveryOption) {
      setDeliveryOptionsByCostCenter((prev) => ({
        ...prev,
        [costCenter]: {
          ...prev[costCenter],
          [seller]: newDeliveryOption,
        },
      }))
    }
  }

  const packages = Object.keys(shippingOptionsBySeller).length

  useEffect(() => {
    Object.entries(shippingOptionsBySeller).forEach(([seller, slas]) => {
      if (!deliveryOptionsByCostCenter[costCenter]?.[seller]) {
        setDeliveryOptionsByCostCenter((prev) => ({
          ...prev,
          [costCenter]: {
            ...prev[costCenter],
            [seller]: slas[0],
          },
        }))
      }
    })
  }, [
    costCenter,
    deliveryOptionsByCostCenter,
    setDeliveryOptionsByCostCenter,
    shippingOptionsBySeller,
  ])

  useEffect(() => {
    const sellersInShippingOptions = Object.keys(shippingOptionsBySeller ?? {})
    const invalidShippingOptionSellers = Object.values(
      deliveryOptionsByCostCenter
    )
      .map((sellerSla) => Object.keys(sellerSla))
      .reduce((acc, sellers) => [...acc, ...sellers], [])
      .filter(
        (value, index, self) =>
          self.findIndex((seller) => seller === value) === index &&
          !sellersInShippingOptions.includes(value)
      )

    if (invalidShippingOptionSellers.length) {
      setDeliveryOptionsByCostCenter((prev) => {
        const filtered = Object.entries(prev).reduce(
          (acc, [costCenterFromMap, sellerSla]) => {
            acc[costCenterFromMap] = Object.entries(sellerSla).reduce(
              (accSeller, [sellerFromMap, sla]) => {
                if (!invalidShippingOptionSellers.includes(sellerFromMap)) {
                  accSeller[sellerFromMap] = sla
                }

                return accSeller
              },
              {} as typeof sellerSla
            )

            return acc
          },
          {} as typeof prev
        )

        return {
          ...filtered,
        }
      })
    }
  }, [
    deliveryOptionsByCostCenter,
    setDeliveryOptionsByCostCenter,
    shippingOptionsBySeller,
  ])

  useEffect(() => {
    if (loading) {
      setLoadingGetShipping(true)
    }
  }, [loading, setLoadingGetShipping])

  if (loading && !shippingData?.shipping) {
    return <TotalizerSpinner />
  }

  if (packages === 1) {
    const [singlePackageSlas] = Object.values(shippingOptionsBySeller)
    const [seller] = Object.keys(shippingOptionsBySeller)
    const selectedCostCenterOption =
      deliveryOptionsByCostCenter[costCenter]?.[seller]

    if (singlePackageSlas.length > 1) {
      return (
        <SlaDropdown
          selectedSla={
            selectedCostCenterOption?.id
              ? selectedCostCenterOption
              : singlePackageSlas[0]
          }
          options={singlePackageSlas.map((sla) => ({
            value: sla.id,
            label: `${sla.id} - ${formatPrice((sla.price ?? 0) / 100)}`,
          }))}
          onChange={handleChange(seller)}
          isSmall={hasMultipleCostCenters}
        />
      )
    }

    return <Sla highlightName sla={singlePackageSlas[0]} />
  }

  if (packages > 1) {
    return (
      <div className="flex flex-column flex-wrap">
        <ol
          className={`${handles.shippingEstimates} ${
            hasMultipleCostCenters ? '' : 'flex'
          }`}
        >
          {Object.entries(shippingOptionsBySeller).map(
            ([seller, options], index, array) => {
              const quantity = formatMessage(messages.itemCount, {
                count: options[0].deliveryIds?.[0]?.quantity,
              })

              const singlePrice = formatPrice((options[0].price ?? 0) / 100)
              const selectedCostCenterOption =
                deliveryOptionsByCostCenter[costCenter]?.[seller]

              return (
                <li
                  key={index}
                  className={`flex flex-column flex-wrap ${
                    hasMultipleCostCenters && index < array.length - 1
                      ? 'mb2 pb2'
                      : ''
                  } ${
                    !hasMultipleCostCenters && index % 2 === 0 ? 'mr3' : ''
                  } ${hasMultipleCostCenters ? 'w-100' : 'w-50'}`}
                >
                  <span className="b c-muted-1">
                    {orderForm.sellers?.find((s) => s?.id === seller)?.name} (
                    {quantity})
                  </span>
                  {options.length > 1 ? (
                    <SlaDropdown
                      selectedSla={
                        selectedCostCenterOption?.id
                          ? selectedCostCenterOption
                          : options[0]
                      }
                      options={options.map((sla) => ({
                        value: sla.id,
                        label: `${sla.id} - ${formatPrice(
                          (sla.price ?? 0) / 100
                        )}`,
                      }))}
                      onChange={handleChange(seller)}
                      isSmall={hasMultipleCostCenters}
                    />
                  ) : (
                    <Sla
                      sla={options[0]}
                      price={singlePrice}
                      isSmall={!hasMultipleCostCenters}
                    />
                  )}
                </li>
              )
            }
          )}
        </ol>
      </div>
    )
  }

  return <div>{formatMessage(messages.shippingOptionEmpty)}</div>
}
