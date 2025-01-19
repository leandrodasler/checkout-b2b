import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from 'react-apollo'
import { useIntl } from 'react-intl'
import { Query } from 'ssesandbox04.checkout-b2b'
import { MutationSetManualPrice } from 'vtex.checkout-resources'
import 'vtex.country-codes/locales'
import { useCssHandles } from 'vtex.css-handles'
import { Button, PageBlock, Slider, Table, Totalizer } from 'vtex.styleguide'

import { useCheckoutB2BContext } from '../CheckoutB2BContext'
import GET_APP_SETTINGS from '../graphql/getAppSettings.graphql'
import {
  useClearCart,
  useOrderFormCustom,
  useOrganization,
  usePermissions,
  useTableSchema,
  useToast,
  useToolbar,
  useTotalizers,
} from '../hooks'
import '../styles.css'
import { CompleteOrderForm } from '../typings'
import { messages } from '../utils'
import { ContactInfos } from './ContactInfos'

type AppSettingsQuery = Pick<Query, 'getAppSettings'>

export function CheckoutB2bTable() {
  const handles = useCssHandles(['container', 'table'])
  const { loading: organizationLoading } = useOrganization()
  const {
    loading: orderFormLoading,
    orderForm,
    setOrderForm,
  } = useOrderFormCustom()

  const { clearCart, isLoading: clearCartLoading } = useClearCart()
  const totalizers = useTotalizers()
  const {
    discountApplied = 0,
    setDiscountApplied,
    setMaximumDiscount,
    subtotal,
    listedPrice,
    percentualDiscount,
    setPercentualDiscount,
  } = useCheckoutB2BContext()

  const toolbar = useToolbar()
  const [isEditing, setIsEditing] = useState(false)
  const [prices, setPrices] = useState<Record<string, number>>({})
  const { formatMessage } = useIntl()
  const { items } = orderForm

  const loading = useMemo(() => orderFormLoading || organizationLoading, [
    orderFormLoading,
    organizationLoading,
  ])

  const showToast = useToast()

  const { data } = useQuery<AppSettingsQuery>(GET_APP_SETTINGS, { ssr: false })
  const { maximumDiscount, isSalesUser } = usePermissions(data?.getAppSettings)

  useEffect(() => {
    if (listedPrice > 0) {
      const discountPercentage = ((listedPrice - subtotal) / listedPrice) * 100

      setPercentualDiscount(discountPercentage)
    }
  }, [listedPrice, subtotal, setPercentualDiscount])

  useEffect(() => {
    setMaximumDiscount(maximumDiscount)
  }, [maximumDiscount, setMaximumDiscount])

  const sliderMaxValue = useMemo(() => {
    return Math.min(maximumDiscount, maximumDiscount - percentualDiscount)
  }, [maximumDiscount, percentualDiscount])

  const filteredItems = toolbar?.filteredItems ?? items

  const updatePrice = useCallback((id: string, newPrice: number) => {
    setPrices((prevPrices) => {
      const updatedPrices = {
        ...prevPrices,
        [id]: newPrice,
      }

      return updatedPrices
    })
  }, [])

  const schema = useTableSchema(isEditing, discountApplied, updatePrice)

  const [setManualPrice, { loading: saving }] = useMutation(
    MutationSetManualPrice,
    {
      onCompleted: ({ updateOrderFormPayment }) => {
        setOrderForm({
          ...orderForm,
          ...updateOrderFormPayment,
        } as CompleteOrderForm)
      },
      onError: (error) => {
        console.error('Erro na mutação:', error)
        showToast?.({ message: error.message })
      },
    }
  )

  const getUpdatedPrices = useCallback(() => {
    return filteredItems.map((item, index) => ({
      orderFormId: orderForm.id,
      itemIndex: index,
      price: prices[item.id] ?? item.manualPrice ?? item.sellingPrice,
    }))
  }, [filteredItems, prices, orderForm.id])

  const handleSavePrices = async () => {
    if (percentualDiscount > maximumDiscount) {
      showToast?.({ message: 'Desconto acima do limite' })

      return
    }

    const updatedPrices = getUpdatedPrices()

    try {
      for await (const item of updatedPrices) {
        await setManualPrice({
          variables: {
            orderFormId: item.orderFormId,
            manualPriceInput: {
              itemIndex: item.itemIndex,
              price: Math.round(item.price),
            },
          },
        })
      }

      showToast?.({
        message: formatMessage(messages.manualPriceSuccess),
      })
    } catch (error) {
      console.error('Erro ao salvar os preços:', error)
      showToast?.({
        message: formatMessage(messages.manualPriceError),
      })
    }
  }

  const toggleEditMode = () => {
    setIsEditing((prev) => !prev)
  }

  return (
    <div className={handles.container}>
      <PageBlock>
        {!loading && (
          <div className="mb4">
            <ContactInfos />
            <Totalizer items={totalizers} />
          </div>
        )}

        <div className={handles.table}>
          <Table
            loading={loading}
            fullWidth
            schema={schema}
            items={filteredItems}
            density="high"
            emptyStateLabel={formatMessage(messages.emptyCart)}
            toolbar={!loading && toolbar}
          />
        </div>
      </PageBlock>
      {isEditing && (
        <Slider
          onChange={(values: number[]) => {
            const [newDiscount] = values

            setDiscountApplied(newDiscount)

            filteredItems.forEach((item) => {
              const originalPrice = item.manualPrice ?? item.sellingPrice ?? 0
              const discountedPrice = originalPrice * (1 - newDiscount / 100)

              updatePrice(item.id, Math.max(0, discountedPrice))
            })
          }}
          min={0}
          max={sliderMaxValue}
          step={1}
          defaultValues={[discountApplied]}
          formatValue={(value: number) => `${value}%`}
        />
      )}
      {isSalesUser && (
        <div className="flex flex-wrap">
          <Button
            variation={isEditing ? 'danger' : 'primary'}
            onClick={toggleEditMode}
          >
            {isEditing
              ? formatMessage(messages.manualPriceStopEdit)
              : formatMessage(messages.editManualPrice)}
          </Button>
          <Button
            variation="primary"
            onClick={handleSavePrices}
            isLoading={saving}
            disabled={!items.length || saving}
          >
            {formatMessage(messages.saveManualPrice)}
          </Button>

          {!!items.length && !loading && (
            <Button
              variation="danger-tertiary"
              onClick={clearCart}
              isLoading={clearCartLoading}
            >
              {formatMessage(messages.clearCart)}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
