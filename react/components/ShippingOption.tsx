import React, { useMemo } from 'react'
import { useMutation } from 'react-apollo'
import { useIntl } from 'react-intl'
import type {
  Mutation,
  MutationUpdateShippingOptionArgs,
} from 'ssesandbox04.checkout-b2b'
import { Address } from 'vtex.b2b-organizations-graphql'
import { useCssHandles } from 'vtex.css-handles'
import type { DeliveryIds, ShippingSla } from 'vtex.store-graphql'

import { useCheckoutB2BContext } from '../CheckoutB2BContext'
import MUTATION_UPDATE_SHIPPING_OPTION from '../graphql/updateShippingOption.graphql'
import { useFormatPrice, useOrderFormCustom, useToast } from '../hooks'
import { isSameAddress, messages } from '../utils'
import { Sla } from './Sla'
import { SlaDropdown } from './SlaDrodown'

type MutationUpdateShippingOption = Pick<Mutation, 'updateShippingOption'>

type Props = {
  costCenter: string
  address?: Address | null
}

export function ShippingOption({ address }: Props) {
  const showToast = useToast()
  const handles = useCssHandles(['shippingEstimates'])
  const { formatMessage } = useIntl()
  const { orderForm, setOrderForm } = useOrderFormCustom()
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
      logisticsInfoFromAddress.reduce<
        Record<string, { selectedSla: ShippingSla; slas: ShippingSla[] }>
      >((acc, l) => {
        const item = orderForm.items.find((i) => i.itemIndex === l.itemIndex)

        if (!item) return acc

        const seller = item.seller ?? '1'
        const selectedSla = l.slas?.find((sla) => sla?.id === l.selectedSla)

        acc[seller] = acc[seller] ?? { selectedSla, slas: [] }

        l.slas?.forEach((sla) => {
          if (!sla) return

          const addedSlaIndex = acc[seller].slas.findIndex(
            (s) => s.id === sla.id
          )

          if (addedSlaIndex !== -1) {
            const addedSla = acc[seller].slas[addedSlaIndex]
            const mergedDeliveryIds: DeliveryIds[] = [
              ...((addedSla.deliveryIds as DeliveryIds[]) ?? []),
            ]

            sla.deliveryIds?.forEach((delivery, index) => {
              if (!mergedDeliveryIds[index]) {
                mergedDeliveryIds[index] = { ...delivery }
              } else {
                mergedDeliveryIds[index] = {
                  ...mergedDeliveryIds[index],
                  quantity:
                    (mergedDeliveryIds[index].quantity ?? 0) +
                    (delivery?.quantity ?? 0),
                }
              }
            })

            acc[seller].slas[addedSlaIndex] = {
              ...addedSla,
              price: (addedSla.price ?? 0) + (sla.price ?? 0),
              deliveryIds: mergedDeliveryIds,
            }
          } else {
            acc[seller].slas.push({
              ...sla,
              deliveryIds: sla.deliveryIds?.map((d) => ({ ...d })) ?? [],
            })
          }
        })

        return acc
      }, {}),
    [logisticsInfoFromAddress, orderForm.items]
  )

  const [updateShippingOption, { loading }] = useMutation<
    MutationUpdateShippingOption,
    MutationUpdateShippingOptionArgs
  >(MUTATION_UPDATE_SHIPPING_OPTION, {
    onError: showToast,
    onCompleted(data) {
      setOrderForm({
        ...orderForm,
        ...data.updateShippingOption,
        paymentAddress: orderForm.paymentAddress,
        customData: orderForm.customData,
      })
    },
  })

  const handleChange = (seller: string) => (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newDeliveryOption = shippingOptionsBySeller[seller].slas.find(
      (sla) => sla.id === e.target.value
    )

    if (newDeliveryOption?.id && addressInSelected?.addressId) {
      setPending(true)

      updateShippingOption({
        variables: {
          addressId: addressInSelected.addressId,
          selectedSla: newDeliveryOption.id,
        },
      }).then(() => setPending(false))
    }
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
            label: `${sla.id} - ${formatPrice((sla.price ?? 0) / 100)}`,
          }))}
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
              count: options.slas[0].deliveryIds?.[0]?.quantity,
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
                      label: `${sla.id} - ${formatPrice(
                        (sla.price ?? 0) / 100
                      )}`,
                    }))}
                    onChange={handleChange(seller)}
                    isLoading={loading}
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
