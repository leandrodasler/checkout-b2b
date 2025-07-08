import React from 'react'
import { useMutation, useQuery } from 'react-apollo'
import { useIntl } from 'react-intl'
import { Address } from 'vtex.b2b-organizations-graphql'
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
import { Dropdown } from 'vtex.styleguide'

import { useCheckoutB2BContext } from '../CheckoutB2BContext'
import GET_SHIPPING from '../graphql/getShipping.graphql'
import { useFormatPrice, useOrderFormCustom, useToast } from '../hooks'
import type { CompleteOrderForm } from '../typings'
import { messages } from '../utils'
import { TotalizerSpinner } from './TotalizerSpinner'

type QueryShipping = Pick<StoreGraphqlQuery, 'shipping'>
type Props = {
  address?: Address | null
  costCenterName?: string | null
}

export function ShippingOption({ address, costCenterName }: Props) {
  const showToast = useToast()
  const handles = useCssHandles(['shippingEstimates'])
  const { formatMessage } = useIntl()
  const { orderForm, setOrderForm } = useOrderFormCustom()
  const { setPending } = useCheckoutB2BContext()
  const { selectedAddress, deliveryOptions } = orderForm.shipping
  const formatPrice = useFormatPrice()

  const currentAddress = address ?? selectedAddress

  const { data: shippingData, loading: shippingLoading } = useQuery<
    QueryShipping,
    QueryShippingArgs
  >(GET_SHIPPING, {
    ssr: false,
    skip: !currentAddress || !!deliveryOptions.length,
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
    onError({ message }) {
      showToast({ message })
    },
  })

  const [selectOption, { loading: selectLoading }] = useMutation<
    SelectDeliveryOptionMutation,
    SelectDeliveryOptionMutationVariables
  >(MutationSelectDeliveryOption, {
    onCompleted({ selectDeliveryOption }) {
      setOrderForm({
        ...orderForm,
        ...selectDeliveryOption,
      } as CompleteOrderForm)
    },
    onError({ message }) {
      showToast({ message })
    },
  })

  const loading = shippingLoading || selectLoading
  const selectedOption = deliveryOptions?.find((option) => option.isSelected)
  const options = deliveryOptions?.map(({ id, price }) => ({
    value: id,
    label: `${id} - ${formatPrice(price / 100)}`,
  }))

  // const [selectedCostCenterOption, setSelectedCostCenterOption] = useState(
  //   selectedOption
  // )

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // if (!Date.now()) console.log(selectOption.name, setPending)

    // const newDeliveryOption = deliveryOptions?.find(
    //   (option) => option.id === e.target.value
    // )

    // setSelectedCostCenterOption(newDeliveryOption)

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
        {costCenterName && <div className="b mb1">{costCenterName}</div>}
        {selectedOption?.id} -{' '}
        <TranslateEstimate shippingEstimate={selectedOption?.estimate} />
      </>
    )
  }

  if (options.length > 1) {
    return (
      <>
        {costCenterName && <div className="b mb1">{costCenterName}</div>}
        <Dropdown
          size="small"
          placeholder={formatMessage(messages.shippingOption)}
          options={options}
          value={selectedOption?.id}
          onChange={handleChange}
          helpText={
            <span {...(costCenterName && { className: 't-mini' })}>
              <TranslateEstimate shippingEstimate={selectedOption?.estimate} />
            </span>
          }
        />
      </>
    )
  }

  const shippingEstimates = shippingData?.shipping?.logisticsInfo
    ?.map((l) => l?.slas?.[0]?.shippingEstimate)
    .filter(Boolean)
    .filter((value, index, self) => self.indexOf(value) === index)

  const packages = shippingEstimates?.length ?? 0

  if (packages === 1 && shippingEstimates?.[0]) {
    return <TranslateEstimate shippingEstimate={shippingEstimates[0]} />
  }

  if (packages > 1) {
    const packageText = formatMessage(messages.shippingOptionPackages, {
      packages,
    })

    return (
      <div className="flex flex-column flex-wrap">
        <span className="b">
          {costCenterName ? `${costCenterName} (${packageText})` : packageText}
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

  return <>{formatMessage(messages.shippingOptionEmpty)}</>
}
