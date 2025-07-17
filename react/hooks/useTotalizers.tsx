import React, { useCallback, useMemo } from 'react'
import { useIntl } from 'react-intl'
import { FormattedPrice } from 'vtex.formatted-price'
import { ShippingSla } from 'vtex.store-graphql'
import { IconHelp, Tooltip } from 'vtex.styleguide'

import { useFormatPrice, useOrderFormCustom, useTaxes, useTotalMargin } from '.'
import { useCheckoutB2BContext } from '../CheckoutB2BContext'
import { PaymentData } from '../components/PaymentData'
import { PONumber } from '../components/PONumber'
import { TotalizerSpinner } from '../components/TotalizerSpinner'
import { TruncatedText } from '../components/TruncatedText'
import { messages } from '../utils'

export function useTotalizers() {
  const {
    discountApplied,
    deliveryOptionsByCostCenter,
    loadingGetShipping,
  } = useCheckoutB2BContext()

  const { formatMessage } = useIntl()
  const formatPrice = useFormatPrice()
  const { orderForm } = useOrderFormCustom()

  const { totalizers = [], value: total = 0, items } = orderForm

  const hasQuotationDiscount = useMemo(
    () =>
      items?.some(
        (item) => item.manualPrice && item.manualPrice !== item.price
      ),
    [items]
  )

  const { totalMargin } = useTotalMargin()

  const { data: taxes } = useTaxes()

  const taxTotalizers: Record<string, number> = {}

  if ((taxes?.length ?? 0) > 1) {
    items.forEach((item) => {
      item.priceTags.forEach((tag) => {
        if (
          tag.name?.includes('tax@price') &&
          tag.identifier &&
          tag.rawValue &&
          item.sellingPrice
        ) {
          taxTotalizers[tag.identifier] = taxTotalizers[tag.identifier] ?? 0

          if (tag.isPercentual) {
            taxTotalizers[tag.identifier] +=
              tag.rawValue * item.sellingPrice * item.quantity
          } else if (tag.value) {
            taxTotalizers[tag.identifier] += tag.value
          }
        }
      })
    })
  }

  const getCostCenterDeliveryPrice = useCallback(
    (sellerSla: Record<string, ShippingSla>) => {
      return (
        Object.entries(sellerSla)
          .map(([seller, sla]) =>
            orderForm.sellers?.some((s) => s?.id === seller) ? sla.price : 0
          )
          .reduce((acc, value) => (acc ?? 0) + (value ?? 0), 0) ?? 0
      )
    },
    [orderForm.sellers]
  )

  if (!totalizers.length || !items?.length) return []

  const totalPriceWithDiscount = total - (total * discountApplied) / 100

  const totalItemsWithoutDiscount =
    totalizers.find((t) => t.id === 'Items')?.value ?? 0

  const totalItems = items.reduce(
    (acc, item) => acc + (item.sellingPrice ?? 0) * item.quantity,
    0
  )

  const percentualDiscount = Math.round(
    100 - (totalItems / totalItemsWithoutDiscount) * 100
  )

  const totalDiscount = Math.round(percentualDiscount + discountApplied)

  const hasMultipleCostCenters = !!Object.keys(deliveryOptionsByCostCenter)
    .length

  const costCenterDeliveries = Object.entries(
    deliveryOptionsByCostCenter
  ).sort(([cc1], [cc2]) => cc1.localeCompare(cc2))

  return [
    {
      label: formatMessage(messages.paymentMethods),
      value: <PaymentData />,
    },
    {
      label: formatMessage(messages.PONumber),
      value: <PONumber />,
    },
    ...(totalDiscount
      ? [
          {
            label: formatMessage(messages.totalDiscount),
            value: `${totalDiscount}%`,
          },
        ]
      : []),
    ...totalizers.map((t) => ({
      label: t.id === 'Tax' ? formatMessage(messages.tax) : t.name,
      value: (
        <div className="flex flex-wrap">
          {t.id === 'Shipping' && loadingGetShipping ? (
            <TotalizerSpinner />
          ) : t.id === 'Shipping' && hasMultipleCostCenters ? (
            <div className="flex flex-wrap flex-column w-100 t-small">
              <table cellSpacing={1} cellPadding={4} style={{ border: 'none' }}>
                <tbody>
                  {costCenterDeliveries.map(
                    ([costCenter, seller], index, array) => {
                      const costCenterShippingValue = getCostCenterDeliveryPrice(
                        seller
                      )

                      return (
                        <tr
                          key={costCenter}
                          className={index < array.length - 1 ? 'mb1' : ''}
                        >
                          {array.length > 1 && (
                            <th align="right">{costCenter}</th>
                          )}
                          <td>{formatPrice(costCenterShippingValue / 100)}</td>
                        </tr>
                      )
                    }
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <TruncatedText
              text={<FormattedPrice value={t.value / 100} />}
              strike={t.id === 'Items' && totalItems < t.value}
            />
          )}
          {t.id === 'Tax' && taxes?.length && (
            <div className="flex flex-wrap flex-column w-100 t-mini">
              {taxes.map((tax) => (
                <div
                  className="flex flex-wrap"
                  key={tax.idCalculatorConfiguration}
                >
                  {tax.name}
                  {taxes.length > 1 && (
                    <>
                      :{' '}
                      <FormattedPrice
                        value={
                          taxTotalizers[tax.idCalculatorConfiguration] / 100
                        }
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
          {t.id === 'Items' && totalItems < t.value && (
            <div className="w-100">
              <TruncatedText
                text={<FormattedPrice value={totalItems / 100} />}
              />
            </div>
          )}
          {t.id === 'Discounts' && hasQuotationDiscount && (
            <Tooltip label={formatMessage(messages.quotationDiscount)}>
              <span className="ml2">
                <IconHelp />
              </span>
            </Tooltip>
          )}
        </div>
      ),
    })),
    ...(totalMargin
      ? [
          {
            label: formatMessage(messages.totalMargin),
            value: (
              <TruncatedText text={<FormattedPrice value={totalMargin} />} />
            ),
          },
        ]
      : []),
    {
      label: formatMessage(messages.total),
      value: hasMultipleCostCenters ? (
        loadingGetShipping ? (
          <TotalizerSpinner />
        ) : (
          <div className="flex flex-wrap flex-column w-100 t-small">
            <table cellSpacing={1} cellPadding={4} style={{ border: 'none' }}>
              <tbody>
                {costCenterDeliveries.map(
                  ([costCenter, seller], index, array) => {
                    const costCenterShippingValue = getCostCenterDeliveryPrice(
                      seller
                    )

                    return (
                      <tr
                        key={costCenter}
                        className={index < array.length - 1 ? 'mb1' : ''}
                      >
                        {array.length > 1 && (
                          <th align="right">{costCenter}</th>
                        )}
                        <td>
                          {formatPrice(
                            (totalItems + costCenterShippingValue) / 100
                          )}
                        </td>
                      </tr>
                    )
                  }
                )}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <TruncatedText
          text={<FormattedPrice value={totalPriceWithDiscount / 100} />}
        />
      ),
    },
  ]
}
