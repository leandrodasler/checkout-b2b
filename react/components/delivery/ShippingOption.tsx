import React, { useMemo, useRef } from 'react'
import { useIntl } from 'react-intl'
import { Address } from 'vtex.b2b-organizations-graphql'
import { useCssHandles } from 'vtex.css-handles'

import { useCheckoutB2BContext } from '../../CheckoutB2BContext'
import {
  useFormatPrice,
  useOrderFormCustom,
  useUpdateShippingOption,
} from '../../hooks'
import {
  groupShippingOptionsBySeller,
  isItemUnavailable,
  isSameAddress,
  messages,
} from '../../utils'
import { TruncatedText } from '../common/TruncatedText'
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
      groupShippingOptionsBySeller(
        logisticsInfoFromAddress,
        orderForm.items.filter((item) => !isItemUnavailable(item))
      ),
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

  const sellersQuantity = Object.keys(shippingOptionsBySeller).length

  if (sellersQuantity === 1) {
    const [singleSellerSlas] = Object.values(shippingOptionsBySeller)
    const [seller] = Object.keys(shippingOptionsBySeller)

    if (singleSellerSlas.slas.length > 1) {
      return (
        <SlaDropdown
          selectedSla={singleSellerSlas.selectedSla ?? singleSellerSlas.slas[0]}
          itemCountBySelectedEstimate={
            singleSellerSlas.itemCountBySelectedEstimate
          }
          options={singleSellerSlas.slas.map((sla) => ({
            value: sla.id,
            label: `${sla.name}${
              sla.price ? ` - ${formatPrice((sla.price ?? 0) / 100)}` : ''
            }`,
          }))}
          shippingEstimates={singleSellerSlas.shippingEstimates}
          onChange={handleChange(seller)}
          isLoading={loading}
        />
      )
    }

    return <Sla highlightName sla={singleSellerSlas.slas[0]} />
  }

  if (sellersQuantity > 1) {
    return (
      <ol className={`${handles.shippingEstimates} flex flex-wrap`}>
        {Object.entries(shippingOptionsBySeller).map(
          ([sellerId, options], index) => {
            const quantity = formatMessage(messages.itemCount, {
              count: orderForm.items
                .filter((item) => !isItemUnavailable(item))
                .reduce(
                  (acc, item) => acc + (item.seller === sellerId ? 1 : 0),
                  0
                ),
            })

            const singlePrice = formatPrice((options.slas[0].price ?? 0) / 100)
            const seller = orderForm.sellers?.find((s) => s?.id === sellerId)
            const sellerInfo = (
              <>
                {seller?.name}
                <br />({quantity})
              </>
            )

            return (
              <li key={index} className="flex flex-column flex-wrap">
                <TruncatedText
                  label={
                    <>
                      {formatMessage(messages.seller)}: {sellerInfo}
                    </>
                  }
                  text={<span className="b c-muted-1">{sellerInfo}</span>}
                />
                {options.slas.length > 1 ? (
                  <SlaDropdown
                    selectedSla={options.selectedSla ?? options.slas[0]}
                    itemCountBySelectedEstimate={
                      options.itemCountBySelectedEstimate
                    }
                    options={options.slas.map((sla) => ({
                      value: sla.id,
                      label: `${sla.name}${
                        sla.price
                          ? ` - ${formatPrice((sla.price ?? 0) / 100)}`
                          : ''
                      }`,
                    }))}
                    shippingEstimates={options.shippingEstimates}
                    onChange={handleChange(sellerId)}
                    isLoading={loading && loadingSellerRef.current === sellerId}
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
