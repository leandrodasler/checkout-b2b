import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import type { OrderForm, Totalizer } from 'vtex.checkout-graphql'
import { FormattedPrice } from 'vtex.formatted-price'
import { useRuntime } from 'vtex.render-runtime'
import { Dropdown, Input } from 'vtex.styleguide'

import { messages } from './messages'

function PONumber() {
  const { formatMessage } = useIntl()
  const [selectedPONumber, setSelectedPoNumber] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedPoNumber(e.target.value)
  }

  return (
    <div className="mb5">
      <Input
        placeholder={formatMessage(messages.PONumber)}
        type="number"
        value={selectedPONumber ?? ''}
        dataAttributes={{ 'hj-white-list': true, test: 'string' }}
        onChange={handleChange}
      />
    </div>
  )
}

function PaymentData({ data }: { data: OrderForm['paymentData'] }) {
  const { formatMessage } = useIntl()

  const [selectedPayment, setSelectedPayment] = useState<string | null>(null)
  const filteredPaymentSystems = data.paymentSystems.filter(
    (paymentSystem) => paymentSystem.groupName !== 'creditCardPaymentGroup'
  )

  const options = filteredPaymentSystems.map((paymentSystem) => ({
    value: paymentSystem.id,
    label: paymentSystem.name,
  }))

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPayment(e.target.value)
  }

  return (
    <div className="mb5">
      <Dropdown
        placeholder={formatMessage(messages.selectPaymentMethods)}
        options={options}
        value={selectedPayment ?? ''}
        onChange={handleChange}
      />
    </div>
  )
}

interface UseTotalizersParams {
  totalizers: Totalizer[]
  shipping: OrderForm['shipping']
  total: number
  paymentData: OrderForm['paymentData']
}

export function useTotalizers({
  totalizers,
  shipping,
  total,
  paymentData,
}: UseTotalizersParams) {
  const { formatMessage } = useIntl()

  if (!totalizers.length) return null

  let formattedAddress = formatMessage(messages.emptyAddress)

  if (shipping?.selectedAddress) {
    const { street, number, city, state } = shipping?.selectedAddress

    formattedAddress = `${street}${
      number ? `, ${number}` : ''
    } - ${city}, ${state}`
  }

  return [
    {
      label: formatMessage(messages.selectedAddress),
      value: formattedAddress,
      isLoading: false,
    },
    {
      label: formatMessage(messages.paymentMethods),
      value: <PaymentData data={paymentData} />,
    },
    {
      label: formatMessage(messages.PONumber),
      value: <PONumber />,
    },
    ...totalizers.map((t) => ({
      label: t.name,
      value: <FormattedPrice value={t.value / 100} />,
    })),
    {
      label: formatMessage(messages.total),
      value: <FormattedPrice value={total / 100} />,
    },
  ]
}

export const useTableSchema = () => {
  const { formatMessage } = useIntl()
  const { account } = useRuntime()

  return {
    properties: {
      skuName: {
        minWidth: 300,
        title: formatMessage(messages.name),
        cellRenderer({ cellData }: { cellData: string }) {
          return (
            <span className="truncate" title={cellData}>
              {cellData}
            </span>
          )
        },
      },
      refId: {
        title: formatMessage(messages.refId),
        width: 170,
        cellRenderer({ cellData }: { cellData: string }) {
          return <span>{cellData}</span>
        },
      },
      quantity: {
        width: 100,
        title: formatMessage(messages.quantity),
      },
      additionalInfo: {
        width: 150,
        title: formatMessage(messages.brand),
        cellRenderer({ cellData }: { cellData: { brandName: string } }) {
          const brandName = cellData?.brandName ?? 'N/A'

          return (
            <span className="truncate" title={brandName}>
              {brandName}
            </span>
          )
        },
      },
      sellingPrice: {
        width: 150,
        title: formatMessage(messages.price),
        cellRenderer({ cellData }: { cellData: number }) {
          return <FormattedPrice value={cellData / 100} />
        },
      },
      productCategories: {
        width: 300,
        title: formatMessage(messages.category),
        cellRenderer({ cellData }: { cellData: Record<string, string> }) {
          const categories = Object.values(cellData).join(' / ')

          return <span title={categories}>{categories}</span>
        },
      },
      seller: {
        width: 150,
        title: formatMessage(messages.seller),
        cellRenderer({ cellData }: { cellData: string }) {
          const seller =
            cellData === '1'
              ? account.charAt(0).toUpperCase() + account.slice(1)
              : cellData

          return <span>{seller}</span>
        },
      },
      priceDefinition: {
        width: 150,
        title: formatMessage(messages.totalPrice),
        cellRenderer({ cellData }: { cellData: Record<string, number> }) {
          const totalPrice = cellData.total

          return <FormattedPrice value={totalPrice / 100} />
        },
      },
    },
  }
}
