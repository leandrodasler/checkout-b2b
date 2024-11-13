import React from 'react'
import { useMutation, useQuery } from 'react-apollo'
import { useIntl } from 'react-intl'
import type { OrderForm } from 'vtex.checkout-graphql'
import type {
  SelectDeliveryOptionMutation,
  SelectDeliveryOptionMutationVariables,
} from 'vtex.checkout-resources'
import { MutationSelectDeliveryOption } from 'vtex.checkout-resources'
import { useCssHandles } from 'vtex.css-handles'
import { TranslateEstimate } from 'vtex.shipping-estimate-translator'
import type {
  QueryShippingArgs,
  Query as StoreGraphqlQuery,
} from 'vtex.store-graphql'
import { Dropdown, withToast } from 'vtex.styleguide'

import { useCheckoutB2BContext } from '../CheckoutB2BContext'
import GET_SHIPPING from '../graphql/getShipping.graphql'
import { useFormatPrice, useOrderFormCustom } from '../hooks'
import type { WithToast } from '../typings'
import { messages } from '../utils'
import { TotalizerSpinner } from './TotalizerSpinner'

type QueryShipping = Pick<StoreGraphqlQuery, 'shipping'>

function ShippingOptionWrapper({ showToast }: WithToast) {
  const handles = useCssHandles(['shippingEstimates'])
  const { formatMessage } = useIntl()
  const { orderForm, setOrderForm } = useOrderFormCustom()
  const { setPending } = useCheckoutB2BContext()
  const { selectedAddress, deliveryOptions } = orderForm.shipping
  const formatPrice = useFormatPrice()

  const { data: shippingData, loading: shippingLoading } = useQuery<
    QueryShipping,
    QueryShippingArgs
  >(GET_SHIPPING, {
    ssr: false,
    skip: !selectedAddress || !!deliveryOptions.length,
    variables: {
      postalCode: selectedAddress?.postalCode,
      geoCoordinates: selectedAddress?.geoCoordinates?.map((c) => String(c)),
      country: selectedAddress?.country,
      items: orderForm.items.map((item) => ({
        id: item.id,
        quantity: String(item.quantity),
        seller: item.seller,
      })),
    },
    onError({ message }) {
      showToast?.({ message })
    },
  })

  const [selectOption, { loading: selectLoading }] = useMutation<
    SelectDeliveryOptionMutation,
    SelectDeliveryOptionMutationVariables
  >(MutationSelectDeliveryOption, {
    onCompleted({ selectDeliveryOption }) {
      setOrderForm(selectDeliveryOption as OrderForm)
    },
    onError({ message }) {
      showToast?.({ message })
    },
  })

  const loading = shippingLoading || selectLoading
  const selectedOption = deliveryOptions?.find((option) => option.isSelected)
  const options = deliveryOptions?.map(({ id, price }) => ({
    value: id,
    label: `${id} - ${formatPrice(price / 100)}`,
  }))

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPending(true)

    selectOption({
      variables: {
        deliveryOptionId: e.target.value,
      },
    }).finally(() => setPending(false))
  }

  if (loading) {
    return <TotalizerSpinner />
  }

  if (options.length === 1) {
    return (
      <>
        {selectedOption?.id} -{' '}
        <TranslateEstimate shippingEstimate={selectedOption?.estimate} />
      </>
    )
  }

  if (options.length > 1) {
    return (
      <Dropdown
        size="small"
        placeholder={formatMessage(messages.shippingOption)}
        options={options}
        value={selectedOption?.id}
        onChange={handleChange}
        helpText={
          <TranslateEstimate shippingEstimate={selectedOption?.estimate} />
        }
      />
    )
  }

  const shipping = shippingData?.shipping
  const shippingEstimates = shipping?.logisticsInfo
    ?.map((l) => l?.slas?.[0]?.shippingEstimate)
    .filter(Boolean)
    .filter((value, index, self) => self.indexOf(value) === index)

  const packages = shippingEstimates?.length ?? 0

  if (packages === 1 && shippingEstimates?.[0]) {
    return <TranslateEstimate shippingEstimate={shippingEstimates[0]} />
  }

  if (packages > 1) {
    return (
      <div className="flex items-center">
        <span className="b">
          {formatMessage(messages.shippingOptionPackages, { packages })}:
        </span>
        <ol className={handles.shippingEstimates}>
          {shippingEstimates?.map(
            (estimate, index) =>
              estimate && (
                <li key={`estimate-${index}`}>
                  <TranslateEstimate shippingEstimate={estimate} />
                </li>
              )
          )}
        </ol>
      </div>
    )
  }

  return formatMessage(messages.shippingOptionEmpty)
}

export const ShippingOption = withToast(ShippingOptionWrapper)
