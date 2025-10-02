import React, { useMemo, useRef } from 'react'
import { useIntl } from 'react-intl'
import { Address } from 'vtex.b2b-organizations-graphql'
import { useCssHandles } from 'vtex.css-handles'

import { useCheckoutB2BContext } from '../CheckoutB2BContext'
import {
  useFormatPrice,
  useOrderFormCustom,
  useUpdateShippingOption,
} from '../hooks'
import { groupShippingOptionsBySeller, isSameAddress, messages } from '../utils'
import { Sla } from './Sla'
import { SlaDropdown } from './SlaDrodown'

type Props = {
  costCenter: string
  address?: Address | null
}

export function ShippingOption({ address }: Props) {
  const handles = useCssHandles(['shippingEstimates'])
  const { formatMessage } = useIntl()
  const { orderForm } = useOrderFormCustom()
  const { setPending } = useCheckoutB2BContext()
  const formatPrice = useFormatPrice()
  const { logisticsInfo, selectedAddresses } = orderForm.shippingData

  const addressInSelected = selectedAddresses.find((a) =>
    isSameAddress(a, address)
  )

  const logisticsInfoFromAddress = logisticsInfo.filter(
    (l) => l.addressId === addressInSelected?.addressId
  )

  const shippingOptionsBySeller = useMemo(
    () =>
      groupShippingOptionsBySeller(logisticsInfoFromAddress, orderForm.items),
    [logisticsInfoFromAddress, orderForm.items]
  )

  const [updateShippingOption, { loading }] = useUpdateShippingOption()

  const loadingSellerRef = useRef<string | null>(null)

  const handleChange = (seller: string) => (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newDeliveryOption = shippingOptionsBySeller[seller].slas.find(
      (sla) => sla.id === e.target.value
    )

    if (!newDeliveryOption?.id) return

    setPending(true)

    loadingSellerRef.current = seller

    const itemIndexes = orderForm.items
      .filter(
        (item) =>
          item.seller === seller &&
          logisticsInfoFromAddress.some((li) => li.itemIndex === item.itemIndex)
      )
      .map((item) => item.itemIndex)

    updateShippingOption({
      variables: {
        itemIndexes,
        selectedSla: newDeliveryOption.id,
      },
    }).then(() => setPending(false))
  }

  const packages = Object.keys(shippingOptionsBySeller).length

  if (packages === 1) {
    const [singlePackageSlas] = Object.values(shippingOptionsBySeller)
    const [seller] = Object.keys(shippingOptionsBySeller)

    if (singlePackageSlas.slas.length > 1) {
      return (
        <SlaDropdown
          selectedSla={
            singlePackageSlas.selectedSla ?? singlePackageSlas.slas[0]
          }
          options={singlePackageSlas.slas.map((sla) => ({
            value: sla.id,
            label: `${sla.name}${
              sla.price ? ` - ${formatPrice((sla.price ?? 0) / 100)}` : ''
            }`,
          }))}
          shippingEstimates={singlePackageSlas.shippingEstimates}
          onChange={handleChange(seller)}
          isLoading={loading}
        />
      )
    }

    return <Sla highlightName sla={singlePackageSlas.slas[0]} />
  }

  if (packages > 1) {
    return (
      <ol className={`${handles.shippingEstimates} flex flex-wrap`}>
        {Object.entries(shippingOptionsBySeller).map(
          ([seller, options], index) => {
            const quantity = formatMessage(messages.itemCount, {
              count: orderForm.items.reduce(
                (acc, item) =>
                  acc + (item.seller === seller ? item.quantity : 0),
                0
              ),
            })

            const singlePrice = formatPrice((options.slas[0].price ?? 0) / 100)

            return (
              <li key={index} className="flex flex-column flex-wrap">
                <span className="b c-muted-1">
                  {orderForm.sellers?.find((s) => s?.id === seller)?.name} (
                  {quantity})
                </span>
                {options.slas.length > 1 ? (
                  <SlaDropdown
                    selectedSla={options.selectedSla ?? options.slas[0]}
                    options={options.slas.map((sla) => ({
                      value: sla.id,
                      label: `${sla.name}${
                        sla.price
                          ? ` - ${formatPrice((sla.price ?? 0) / 100)}`
                          : ''
                      }`,
                    }))}
                    shippingEstimates={options.shippingEstimates}
                    onChange={handleChange(seller)}
                    isLoading={loading && loadingSellerRef.current === seller}
                  />
                ) : (
                  <Sla sla={options.slas[0]} price={singlePrice} />
                )}
              </li>
            )
          }
        )}
      </ol>
    )
  }

  return <div>{formatMessage(messages.shippingOptionEmpty)}</div>
}
